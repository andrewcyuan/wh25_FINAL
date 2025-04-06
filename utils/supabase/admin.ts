// Create a new file: utils/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
  // This will ONLY run on the server
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};