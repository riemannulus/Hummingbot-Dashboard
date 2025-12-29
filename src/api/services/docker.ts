import { getApiClient } from '../client';
import type { DockerContainer, DockerImage } from '../../types/api';

export const dockerService = {
  /**
   * Check if Docker is running
   */
  async isRunning(): Promise<{ is_running: boolean }> {
    const client = getApiClient();
    return client.get<{ is_running: boolean }>('/docker/running');
  },

  /**
   * Get available Docker images
   */
  async getAvailableImages(imageName?: string): Promise<{ images: string[] }> {
    const client = getApiClient();
    return client.get<{ images: string[] }>('/docker/available-images/', { image_name: imageName });
  },

  /**
   * Get active containers
   */
  async getActiveContainers(nameFilter?: string): Promise<DockerContainer[]> {
    const client = getApiClient();
    return client.get<DockerContainer[]>('/docker/active-containers', { name_filter: nameFilter });
  },

  /**
   * Get exited containers
   */
  async getExitedContainers(nameFilter?: string): Promise<DockerContainer[]> {
    const client = getApiClient();
    return client.get<DockerContainer[]>('/docker/exited-containers', { name_filter: nameFilter });
  },

  /**
   * Clean exited containers
   */
  async cleanExitedContainers(): Promise<{ message: string; removed: string[] }> {
    const client = getApiClient();
    return client.post('/docker/clean-exited-containers');
  },

  /**
   * Remove a container
   */
  async removeContainer(
    containerName: string,
    options?: { archive_locally?: boolean; s3_bucket?: string }
  ): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/docker/remove-container/${containerName}`, undefined);
  },

  /**
   * Stop a container
   */
  async stopContainer(containerName: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/docker/stop-container/${containerName}`);
  },

  /**
   * Start a container
   */
  async startContainer(containerName: string): Promise<{ message: string }> {
    const client = getApiClient();
    return client.post(`/docker/start-container/${containerName}`);
  },

  /**
   * Pull Docker image
   */
  async pullImage(imageName: string): Promise<{ status: string; message: string }> {
    const client = getApiClient();
    return client.post('/docker/pull-image/', { image_name: imageName });
  },

  /**
   * Get pull status
   */
  async getPullStatus(): Promise<Record<string, { status: string; progress?: string }>> {
    const client = getApiClient();
    return client.get('/docker/pull-status/');
  },
};


