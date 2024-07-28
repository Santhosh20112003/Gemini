import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://rqaxhijawxrggooibovm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxYXhoaWphd3hyZ2dvb2lib3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjA3MTcxNSwiZXhwIjoyMDM3NjQ3NzE1fQ.KW2tv5CRyFFcmmRWJ62iRuqxY1mAFsTw9p6nbYh1Nls"
);
export default supabase;
