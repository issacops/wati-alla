-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (extends auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contacts table
CREATE TABLE contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_unsubscribed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Templates table
CREATE TABLE templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meta_template_id TEXT UNIQUE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  category TEXT CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  language TEXT DEFAULT 'en_US',
  components JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Campaigns table
CREATE TABLE campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  template_id UUID REFERENCES templates(id),
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'FAILED')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  total_audience INT DEFAULT 0,
  success_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Campaign Logs table
CREATE TABLE campaign_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  meta_message_id TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (Simplistic for MVP: authenticated users can do everything)
CREATE POLICY "Authenticated users can read users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update users" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can all on contacts" ON contacts FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all on templates" ON templates FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all on campaigns" ON campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can all on campaign_logs" ON campaign_logs FOR ALL TO authenticated USING (true);
