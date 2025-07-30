/**
 * Project: Workflow Automation Platform (Zapier-style App)
 * File: workflow-engine-core.ts
 *
 * This module defines the core structures and logic for a dynamic workflow automation platform.
 * Users can build workflows visually using nodes that represent various automation tasks.
 */

// Core node types for the workflow automation platform
export type NodeType = 'action' | 'trigger' | 'table' | 'page' | 'email' | 'invoice' | 'report' | 'notification';

// Execution status for nodes and workflows
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// Data types that can flow between nodes
export type DataValue = string | number | boolean | object | null | undefined;

// Generic data structure for node inputs/outputs
export interface NodeData {
  [key: string]: DataValue;
}

// Connection between nodes representing data flow
export interface NodeConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceOutput: string;
  targetInput: string;
  label?: string;
}

// Base configuration for all node types
export interface BaseNodeConfig {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  position: { x: number; y: number };
  enabled: boolean;
  retryCount?: number;
  timeout?: number; // in milliseconds
}

// Specific configurations for different node types
export interface ActionNodeConfig extends BaseNodeConfig {
  type: 'action';
  apiEndpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  payload?: NodeData;
}

export interface TriggerNodeConfig extends BaseNodeConfig {
  type: 'trigger';
  triggerType: 'webhook' | 'schedule' | 'event' | 'manual';
  schedule?: string; // cron expression for scheduled triggers
  webhookUrl?: string;
  eventSource?: string;
}

export interface TableNodeConfig extends BaseNodeConfig {
  type: 'table';
  tableName: string;
  operation: 'create' | 'read' | 'update' | 'delete' | 'query';
  schema?: Record<string, 'string' | 'number' | 'boolean' | 'date'>;
  query?: string;
}

export interface PageNodeConfig extends BaseNodeConfig {
  type: 'page';
  pageTitle: string;
  template: string;
  dataSources: string[]; // IDs of table nodes to bind data from
  routePath: string;
}

export interface EmailNodeConfig extends BaseNodeConfig {
  type: 'email';
  recipients: string[];
  subject: string;
  template: string;
  attachments?: string[];
}

export interface InvoiceNodeConfig extends BaseNodeConfig {
  type: 'invoice';
  invoiceTemplate: string;
  customerData: NodeData;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface ReportNodeConfig extends BaseNodeConfig {
  type: 'report';
  reportType: 'pdf' | 'csv' | 'excel';
  template: string;
  dataSource: string; // ID of table node or data source
  emailRecipients?: string[];
}

export interface NotificationNodeConfig extends BaseNodeConfig {
  type: 'notification';
  notificationType: 'push' | 'sms' | 'slack' | 'discord';
  recipients: string[];
  message: string;
  channel?: string;
}

// Union type for all node configurations
export type NodeConfig = 
  | ActionNodeConfig 
  | TriggerNodeConfig 
  | TableNodeConfig 
  | PageNodeConfig 
  | EmailNodeConfig 
  | InvoiceNodeConfig 
  | ReportNodeConfig 
  | NotificationNodeConfig;

// Node execution context with runtime data
export interface NodeExecutionContext {
  nodeId: string;
  workflowId: string;
  executionId: string;
  inputData: NodeData;
  outputData: NodeData;
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  logs: string[];
}

// Workflow definition containing nodes and their connections
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  nodes: NodeConfig[];
  connections: NodeConnection[];
  variables?: NodeData; // Global workflow variables
  settings: {
    maxExecutionTime?: number;
    maxRetries?: number;
    errorHandling: 'stop' | 'continue' | 'retry';
  };
}

// Workflow execution instance
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  triggerData?: NodeData;
  nodeExecutions: NodeExecutionContext[];
  error?: string;
}

// Base class for node processors
export abstract class BaseNodeProcessor {
  protected config: NodeConfig;

  constructor(config: NodeConfig) {
    this.config = config;
  }

  abstract execute(context: NodeExecutionContext): Promise<NodeData>;
  
  protected log(context: NodeExecutionContext, message: string): void {
    context.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  protected validateInputs(context: NodeExecutionContext, requiredFields: string[]): boolean {
    for (const field of requiredFields) {
      if (!(field in context.inputData) || context.inputData[field] === undefined) {
        throw new Error(`Required input field '${field}' is missing`);
      }
    }
    return true;
  }
}

// Mock AI processor for testing and simulation
export class MockAIProcessor extends BaseNodeProcessor {
  async execute(context: NodeExecutionContext): Promise<NodeData> {
    this.log(context, `Executing mock AI process for node ${this.config.name}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Mock different behaviors based on node type
    switch (this.config.type) {
      case 'action':
        return { success: true, data: `Mock API response for ${this.config.name}` };
      case 'table':
        return { recordsAffected: Math.floor(Math.random() * 10) + 1 };
      case 'email':
        return { sent: true, messageId: `msg_${Date.now()}` };
      case 'notification':
        return { delivered: true, recipients: ['user@example.com'] };
      default:
        return { processed: true };
    }
  }
}

// Workflow execution engine
export class WorkflowExecutionEngine {
  private processors: Map<string, BaseNodeProcessor> = new Map();

  registerProcessor(nodeId: string, processor: BaseNodeProcessor): void {
    this.processors.set(nodeId, processor);
  }

  async executeWorkflow(workflow: Workflow, triggerData?: NodeData): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId: workflow.id,
      status: 'running',
      startTime: new Date(),
      triggerData,
      nodeExecutions: [],
    };

    try {
      // Find trigger nodes to start execution
      const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
      
      if (triggerNodes.length === 0) {
        throw new Error('No trigger nodes found in workflow');
      }

      // Execute nodes in topological order
      const executionOrder = this.getExecutionOrder(workflow);
      
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node || !node.enabled) continue;

        const nodeContext: NodeExecutionContext = {
          nodeId: node.id,
          workflowId: workflow.id,
          executionId: execution.id,
          inputData: this.getNodeInputData(node, workflow, execution),
          outputData: {},
          status: 'running',
          startTime: new Date(),
          logs: [],
        };

        try {
          const processor = this.processors.get(nodeId) || new MockAIProcessor(node);
          nodeContext.outputData = await processor.execute(nodeContext);
          nodeContext.status = 'completed';
          nodeContext.endTime = new Date();
        } catch (error) {
          nodeContext.status = 'failed';
          nodeContext.error = error instanceof Error ? error.message : String(error);
          nodeContext.endTime = new Date();
          
          if (workflow.settings.errorHandling === 'stop') {
            execution.status = 'failed';
            execution.error = `Node ${node.name} failed: ${nodeContext.error}`;
            break;
          }
        }

        execution.nodeExecutions.push(nodeContext);
      }

      if (execution.status !== 'failed') {
        execution.status = 'completed';
      }
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
    }

    execution.endTime = new Date();
    return execution;
  }

  private getExecutionOrder(workflow: Workflow): string[] {
    // Simple topological sort implementation
    // In a real system, you'd want a more robust algorithm
    const visited = new Set<string>();
    const order: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Find nodes that this node depends on
      const dependencies = workflow.connections
        .filter(conn => conn.targetNodeId === nodeId)
        .map(conn => conn.sourceNodeId);
      
      dependencies.forEach(visit);
      order.push(nodeId);
    };

    // Start with trigger nodes
    workflow.nodes
      .filter(node => node.type === 'trigger')
      .forEach(node => visit(node.id));

    return order;
  }

  private getNodeInputData(node: NodeConfig, workflow: Workflow, execution: WorkflowExecution): NodeData {
    const inputData: NodeData = {};
    
    // Get data from connected nodes
    const incomingConnections = workflow.connections.filter(conn => conn.targetNodeId === node.id);
    
    for (const connection of incomingConnections) {
      const sourceExecution = execution.nodeExecutions.find(exec => exec.nodeId === connection.sourceNodeId);
      if (sourceExecution && sourceExecution.status === 'completed') {
        const sourceOutputValue = sourceExecution.outputData[connection.sourceOutput];
        inputData[connection.targetInput] = sourceOutputValue;
      }
    }
    
    // Add workflow variables
    if (workflow.variables) {
      Object.assign(inputData, workflow.variables);
    }
    
    // Add trigger data for trigger nodes
    if (node.type === 'trigger' && execution.triggerData) {
      Object.assign(inputData, execution.triggerData);
    }
    
    return inputData;
  }
}

// Utility functions for workflow management
export class WorkflowUtils {
  static validateWorkflow(workflow: Workflow): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for at least one trigger node
    const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node');
    }
    
    // Check for circular dependencies
    if (this.hasCircularDependencies(workflow)) {
      errors.push('Workflow contains circular dependencies');
    }
    
    // Validate connections
    for (const connection of workflow.connections) {
      const sourceNode = workflow.nodes.find(n => n.id === connection.sourceNodeId);
      const targetNode = workflow.nodes.find(n => n.id === connection.targetNodeId);
      
      if (!sourceNode) {
        errors.push(`Connection references non-existent source node: ${connection.sourceNodeId}`);
      }
      if (!targetNode) {
        errors.push(`Connection references non-existent target node: ${connection.targetNodeId}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  private static hasCircularDependencies(workflow: Workflow): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const dependencies = workflow.connections
        .filter(conn => conn.sourceNodeId === nodeId)
        .map(conn => conn.targetNodeId);
      
      for (const depNodeId of dependencies) {
        if (hasCycle(depNodeId)) return true;
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    for (const node of workflow.nodes) {
      if (hasCycle(node.id)) return true;
    }
    
    return false;
  }
}
