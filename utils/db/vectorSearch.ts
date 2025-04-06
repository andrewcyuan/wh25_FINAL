import { supabase } from './supabase';
import { createEmbedding } from '../ai/embeddings';

/**
 * Performs a semantic similarity search in the vector_db table
 * @param query The user's query to find similar forum content
 * @returns The most similar forum content or null if none found
 */
export async function findSimilarForumContent(query: string): Promise<string | null> {
  try {
    // Create embedding for the user's query
    const queryEmbedding = await createEmbedding(query);
    
    // Perform similarity search using pgvector's <-> operator (cosine distance)
    const { data, error } = await supabase.rpc('match_forums', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7, // Adjust threshold as needed
      match_count: 1        // Get the most similar item
    });
    
    if (error) {
      console.error('Error performing vector search:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No similar forum content found');
      return null;
    }
    
    // Return the forum content from the most similar item
    return data[0].forums;
  } catch (error) {
    console.error('Error in vector similarity search:', error);
    return null;
  }
}
