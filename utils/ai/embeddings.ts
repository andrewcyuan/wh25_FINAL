import { pipeline } from '@xenova/transformers';

// Cache the embedding model to avoid reloading it for each request
let embeddingModel: any = null;

/**
 * Creates text embeddings using the gte-small model
 * @param text Text to generate embeddings for
 * @returns Vector embedding as a number array
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    // Initialize the model if it hasn't been loaded yet
    if (!embeddingModel) {
      // Use the gte-small model as requested
      embeddingModel = await pipeline('feature-extraction', 'Xenova/gte-small');
    }

    // Generate embeddings
    const result = await embeddingModel(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Extract the embedding array from the result and ensure it's a number[] type
    const embedding = Array.from(result.data) as number[];
    return embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw new Error('Failed to create embedding');
  }
}
