#!/usr/bin/env ts-node

/**
 * Seed script for database
 * 
 * This script initializes the database with sample data for testing
 * and development purposes. It creates forms, questions, and sample responses.
 */

import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { 
  QUESTION_TYPES,
  QuestionType
} from '../packages/shared/constants';

dotenv.config();

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/fucktyping';
const client = postgres(connectionString);
const db = drizzle(client);

// Sample data generation
function generateUserId() {
  return uuidv4();
}

function generateFormId() {
  return uuidv4();
}

function generateQuestionId() {
  return uuidv4();
}

function generateResponseId() {
  return uuidv4();
}

function generateAnswerId() {
  return uuidv4();
}

function generateRandomQuestionType(): QuestionType {
  const types = Object.values(QUESTION_TYPES);
  return types[Math.floor(Math.random() * types.length)] as QuestionType;
}

function generateQuestionOptions(type: QuestionType): string[] | undefined {
  if (type === QUESTION_TYPES.MULTIPLE_CHOICE) {
    const optionCount = faker.number.int({ min: 2, max: 5 });
    return Array.from({ length: optionCount }, () => faker.lorem.words(3));
  }
  
  if (type === QUESTION_TYPES.YES_NO) {
    return ['Yes', 'No'];
  }
  
  if (type === QUESTION_TYPES.RATING) {
    return ['1', '2', '3', '4', '5'];
  }
  
  return undefined;
}

function generateValidationRules(type: QuestionType): Record<string, any> | undefined {
  const rules: Record<string, any> = {};
  
  if (type === QUESTION_TYPES.TEXT) {
    rules.minLength = faker.number.int({ min: 2, max: 10 });
    rules.maxLength = faker.number.int({ min: 50, max: 500 });
  }
  
  if (type === QUESTION_TYPES.EMAIL) {
    rules.emailFormat = true;
  }
  
  if (type === QUESTION_TYPES.PHONE) {
    rules.phoneFormat = true;
  }
  
  return Object.keys(rules).length > 0 ? rules : undefined;
}

function generateQuestionAnswer(type: QuestionType, options?: string[]): any {
  switch (type) {
    case QUESTION_TYPES.TEXT:
      return faker.lorem.sentence();
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return options ? options[Math.floor(Math.random() * options.length)] : '';
    case QUESTION_TYPES.RATING:
      return faker.number.int({ min: 1, max: 5 }).toString();
    case QUESTION_TYPES.YES_NO:
      return Math.random() > 0.5 ? 'Yes' : 'No';
    case QUESTION_TYPES.EMAIL:
      return faker.internet.email();
    case QUESTION_TYPES.PHONE:
      return faker.phone.number();
    case QUESTION_TYPES.DATE:
      return faker.date.past().toISOString();
    default:
      return '';
  }
}

function generateSentimentScore(): number {
  return Number((Math.random() * 2 - 1).toFixed(2)); // Between -1 and 1
}

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Create users
    const userIds = [];
    for (let i = 0; i < 10; i++) {
      const userId = generateUserId();
      userIds.push(userId);
      
      await db.execute(
        `
        INSERT INTO users (id, email, name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          userId,
          faker.internet.email(),
          faker.person.fullName(),
          new Date(),
          new Date()
        ]
      );
    }
    console.log(`Created ${userIds.length} users`);

    // Create forms
    const forms = [];
    for (let i = 0; i < 15; i++) {
      const formId = generateFormId();
      const ownerId = userIds[Math.floor(Math.random() * userIds.length)];
      const isPublished = Math.random() > 0.2; // 80% are published
      
      forms.push({
        id: formId,
        title: faker.commerce.productName() + ' Feedback',
        description: faker.lorem.paragraph(),
        ownerId,
        isPublished,
        requiresAuth: Math.random() > 0.7, // 30% require auth
        enableVoice: Math.random() > 0.1, // 90% enable voice
      });
      
      await db.execute(
        `
        INSERT INTO forms (id, title, description, owner_id, is_published, requires_auth, enable_voice, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          formId,
          forms[i].title,
          forms[i].description,
          forms[i].ownerId,
          forms[i].isPublished,
          forms[i].requiresAuth,
          forms[i].enableVoice,
          new Date(),
          new Date()
        ]
      );
    }
    console.log(`Created ${forms.length} forms`);

    // Create questions for each form
    const questions = [];
    for (const form of forms) {
      const questionCount = faker.number.int({ min: 3, max: 10 });
      
      for (let i = 0; i < questionCount; i++) {
        const questionId = generateQuestionId();
        const type = generateRandomQuestionType();
        const options = generateQuestionOptions(type);
        const validationRules = generateValidationRules(type);
        
        questions.push({
          id: questionId,
          formId: form.id,
          text: faker.lorem.sentence() + '?',
          description: Math.random() > 0.5 ? faker.lorem.sentence() : undefined,
          type,
          isRequired: Math.random() > 0.3, // 70% are required
          order: i,
          options,
          validationRules,
        });
        
        await db.execute(
          `
          INSERT INTO questions (id, form_id, text, description, type, is_required, "order", options, validation_rules, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `,
          [
            questionId,
            form.id,
            questions[questions.length - 1].text,
            questions[questions.length - 1].description,
            questions[questions.length - 1].type,
            questions[questions.length - 1].isRequired,
            questions[questions.length - 1].order,
            JSON.stringify(questions[questions.length - 1].options),
            JSON.stringify(questions[questions.length - 1].validationRules),
            new Date(),
            new Date()
          ]
        );
      }
    }
    console.log(`Created ${questions.length} questions`);

    // Create responses for each form
    const responses = [];
    for (const form of forms) {
      // Skip some forms to have them without responses
      if (Math.random() > 0.8) continue;
      
      const responseCount = faker.number.int({ min: 1, max: 20 });
      
      for (let i = 0; i < responseCount; i++) {
        const responseId = generateResponseId();
        const isCompleted = Math.random() > 0.3; // 70% are completed
        const respondentId = form.requiresAuth ? userIds[Math.floor(Math.random() * userIds.length)] : undefined;
        
        responses.push({
          id: responseId,
          formId: form.id,
          respondentId,
          completedAt: isCompleted ? new Date() : undefined,
        });
        
        await db.execute(
          `
          INSERT INTO responses (id, form_id, respondent_id, completed_at, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            responseId,
            form.id,
            respondentId,
            isCompleted ? new Date() : null,
            new Date(),
            new Date()
          ]
        );
        
        // Create answers for this response
        const formQuestions = questions.filter(q => q.formId === form.id);
        
        for (const question of formQuestions) {
          // Skip some questions to simulate partial responses
          if (!isCompleted && Math.random() > 0.7) continue;
          
          const answerId = generateAnswerId();
          const answer = generateQuestionAnswer(question.type as QuestionType, question.options);
          const voiceTranscript = form.enableVoice && Math.random() > 0.5 ? faker.lorem.sentence() : undefined;
          const sentimentScore = voiceTranscript ? generateSentimentScore() : undefined;
          
          await db.execute(
            `
            INSERT INTO answers (id, response_id, question_id, value, voice_transcript, sentiment_score, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [
              answerId,
              responseId,
              question.id,
              JSON.stringify(answer),
              voiceTranscript,
              sentimentScore,
              new Date(),
              new Date()
            ]
          );
        }
      }
    }
    console.log(`Created responses and answers for the forms`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the seed function
seed();