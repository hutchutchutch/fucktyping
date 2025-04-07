-- Update schema for enhanced form system with voice features

-- Update responses table with additional fields
ALTER TABLE IF EXISTS responses
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'complete',
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sentiment INTEGER, -- 0-100 score
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS device TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT;

-- Update questions table with additional fields
ALTER TABLE IF EXISTS questions
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS validation JSONB, -- min/max values, regex patterns
ADD COLUMN IF NOT EXISTS conversation_repair JSONB; -- follow-up prompts, clarification messaging

-- Update answers table with voice processing fields
ALTER TABLE IF EXISTS answers
ADD COLUMN IF NOT EXISTS answer_value INTEGER, -- For numerical responses like ratings
ADD COLUMN IF NOT EXISTS original_transcript TEXT, -- Raw transcript from voice
ADD COLUMN IF NOT EXISTS confidence INTEGER, -- Voice processing confidence score (0-100)
ADD COLUMN IF NOT EXISTS audio_url TEXT, -- URL to stored audio response
ADD COLUMN IF NOT EXISTS processing_details JSONB; -- Additional processing metadata

-- Update conversations table with additional fields
ALTER TABLE IF EXISTS conversations
ADD COLUMN IF NOT EXISTS form_id INTEGER REFERENCES forms(id),
ADD COLUMN IF NOT EXISTS ai_settings JSONB, -- model, temperature, etc.
ADD COLUMN IF NOT EXISTS agent_persona TEXT, -- persona used for the conversation
ADD COLUMN IF NOT EXISTS duration INTEGER, -- conversation duration in seconds
ADD COLUMN IF NOT EXISTS interaction_count INTEGER, -- number of back-and-forth exchanges
ADD COLUMN IF NOT EXISTS metadata JSONB; -- additional metadata 

-- Update messages table with additional fields
ALTER TABLE IF EXISTS messages
ADD COLUMN IF NOT EXISTS question_id INTEGER REFERENCES questions(id),
ADD COLUMN IF NOT EXISTS original_audio TEXT, -- URL to audio if it was a voice message
ADD COLUMN IF NOT EXISTS processed_content TEXT, -- Content after any AI processing
ADD COLUMN IF NOT EXISTS sentiment INTEGER, -- Sentiment score for this message
ADD COLUMN IF NOT EXISTS tokens INTEGER, -- Token count for this message
ADD COLUMN IF NOT EXISTS metadata JSONB; -- Additional metadata

-- Add indexes for new relationships
CREATE INDEX IF NOT EXISTS idx_conversations_form_id ON conversations(form_id);
CREATE INDEX IF NOT EXISTS idx_messages_question_id ON messages(question_id);