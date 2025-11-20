import { CapSolverRequest, CapSolverResponse, CapSolverResult } from './types';

const CAPSOLVER_API_BASE = 'https://api.capsolver.com';

export class CapSolverClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 创建任务
   */
  async createTask(taskData: any): Promise<CapSolverResponse> {
    const request: CapSolverRequest = {
      clientKey: this.apiKey,
      task: taskData,
    };

    try {
      const response = await fetch(`${CAPSOLVER_API_BASE}/createTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CapSolverResponse = await response.json();
      return data;
    } catch (error) {
      console.error('CapSolver createTask error:', error);
      throw error;
    }
  }

  /**
   * 获取任务结果
   */
  async getTaskResult(taskId: number): Promise<CapSolverResult> {
    const request = {
      clientKey: this.apiKey,
      taskId,
    };

    try {
      const response = await fetch(`${CAPSOLVER_API_BASE}/getTaskResult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CapSolverResult = await response.json();
      return data;
    } catch (error) {
      console.error('CapSolver getTaskResult error:', error);
      throw error;
    }
  }

  /**
   * 轮询等待任务完成
   */
  async waitForTaskCompletion(
    taskId: number,
    maxWaitTime: number = 300000,
    pollInterval: number = 3000
  ): Promise<CapSolverResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.getTaskResult(taskId);

      if (result.status === 'ready') {
        return result;
      }

      if (result.errorId !== 0) {
        throw new Error(
          `CapSolver error: ${result.errorCode} - ${result.errorDescription}`
        );
      }

      // 等待后再查询
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error('Task completion timeout');
  }

  /**
   * 验证 API 密钥是否有效
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // 发送一个简单的请求来验证密钥
      const response = await fetch(`${CAPSOLVER_API_BASE}/getBalance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientKey: this.apiKey,
        }),
      });

      const data = await response.json();
      return data.errorId === 0 || data.balance !== undefined;
    } catch (error) {
      console.error('CapSolver validation error:', error);
      return false;
    }
  }
}
