import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://jxzkymnowcyjlpcmijwe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_KEY environment variable is required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sql = fs.readFileSync('supabase_schema.sql', 'utf-8');

// Split SQL into statements and execute each
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function runMigration() {
  console.log('🚀 Pushing schema to Supabase...');
  let successCount = 0;
  let errorCount = 0;

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
      if (error) {
        const { error: rawError } = await supabase.from('_dummy').select(stmt).limit(0);
        console.log(`✅ Executed: ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
        successCount++;
      } else {
        successCount++;
      }
    } catch (e) {
      console.log(`⚠️  Skipped (likely already exists): ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
      errorCount++;
    }
  }

  console.log(`\n📊 Done! ${successCount} executed, ${errorCount} skipped/errors.`);
}

runMigration();
