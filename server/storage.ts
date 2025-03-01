import {
  User, InsertUser, Category, InsertCategory, Form, InsertForm, 
  Question, InsertQuestion, Response, InsertResponse, Answer, 
  InsertAnswer, Conversation, InsertConversation, Message, 
  InsertMessage, FormWithQuestions, ResponseWithAnswers, CategoryWithStats,
  VoiceAgent, InsertVoiceAgent, VoiceAgentNode, InsertVoiceAgentNode,
  VoiceAgentEdge, InsertVoiceAgentEdge, VoiceAgentSession, InsertVoiceAgentSession,
  VoiceAgentWithNodes
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoriesByUserId(userId: number): Promise<Category[]>;
  getCategoryWithStats(id: number): Promise<CategoryWithStats | undefined>;
  getAllCategoriesWithStats(userId: number): Promise<CategoryWithStats[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Form operations
  getForm(id: number): Promise<Form | undefined>;
  getFormWithQuestions(id: number): Promise<FormWithQuestions | undefined>;
  getFormsByUserId(userId: number): Promise<Form[]>;
  getFormsByCategoryId(categoryId: number): Promise<Form[]>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: number, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;
  
  // Question operations
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByFormId(formId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<boolean>;
  
  // Response operations
  getResponse(id: number): Promise<Response | undefined>;
  getResponseWithAnswers(id: number): Promise<ResponseWithAnswers | undefined>;
  getResponsesByFormId(formId: number): Promise<Response[]>;
  createResponse(response: InsertResponse): Promise<Response>;
  
  // Answer operations
  getAnswer(id: number): Promise<Answer | undefined>;
  getAnswersByResponseId(responseId: number): Promise<Answer[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  
  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByResponseId(responseId: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Voice Agent operations
  getVoiceAgent(id: number): Promise<VoiceAgent | undefined>;
  getVoiceAgentByFormId(formId: number): Promise<VoiceAgent | undefined>;
  getVoiceAgentWithDetails(id: number): Promise<VoiceAgentWithNodes | undefined>;
  createVoiceAgent(agent: InsertVoiceAgent): Promise<VoiceAgent>;
  updateVoiceAgent(id: number, agent: Partial<InsertVoiceAgent>): Promise<VoiceAgent | undefined>;
  deleteVoiceAgent(id: number): Promise<boolean>;
  
  // Voice Agent Node operations
  getVoiceAgentNode(id: number): Promise<VoiceAgentNode | undefined>;
  getVoiceAgentNodesByAgentId(agentId: number): Promise<VoiceAgentNode[]>;
  createVoiceAgentNode(node: InsertVoiceAgentNode): Promise<VoiceAgentNode>;
  updateVoiceAgentNode(id: number, node: Partial<InsertVoiceAgentNode>): Promise<VoiceAgentNode | undefined>;
  deleteVoiceAgentNode(id: number): Promise<boolean>;
  
  // Voice Agent Edge operations
  getVoiceAgentEdge(id: number): Promise<VoiceAgentEdge | undefined>;
  getVoiceAgentEdgesByAgentId(agentId: number): Promise<VoiceAgentEdge[]>;
  createVoiceAgentEdge(edge: InsertVoiceAgentEdge): Promise<VoiceAgentEdge>;
  deleteVoiceAgentEdge(id: number): Promise<boolean>;
  
  // Voice Agent Session operations
  getVoiceAgentSession(id: number): Promise<VoiceAgentSession | undefined>;
  getVoiceAgentSessionsByAgentId(agentId: number): Promise<VoiceAgentSession[]>;
  createVoiceAgentSession(session: InsertVoiceAgentSession): Promise<VoiceAgentSession>;
  updateVoiceAgentSession(id: number, session: Partial<InsertVoiceAgentSession>): Promise<VoiceAgentSession | undefined>;
  
  // Generate LangGraph agent from form
  generateVoiceAgentFromForm(formId: number): Promise<VoiceAgentWithNodes | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private forms: Map<number, Form> = new Map();
  private questions: Map<number, Question> = new Map();
  private responses: Map<number, Response> = new Map();
  private answers: Map<number, Answer> = new Map();
  private conversations: Map<number, Conversation> = new Map();
  private messages: Map<number, Message> = new Map();
  private voiceAgents: Map<number, VoiceAgent> = new Map();
  private voiceAgentNodes: Map<number, VoiceAgentNode> = new Map();
  private voiceAgentEdges: Map<number, VoiceAgentEdge> = new Map();
  private voiceAgentSessions: Map<number, VoiceAgentSession> = new Map();
  
  private userIdCounter = 1;
  private categoryIdCounter = 1;
  private formIdCounter = 1;
  private questionIdCounter = 1;
  private responseIdCounter = 1;
  private answerIdCounter = 1;
  private conversationIdCounter = 1;
  private messageIdCounter = 1;
  private voiceAgentIdCounter = 1;
  private voiceAgentNodeIdCounter = 1;
  private voiceAgentEdgeIdCounter = 1;
  private voiceAgentSessionIdCounter = 1;

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const user: User = { 
      id, 
      ...insertUser,
      createdAt: timestamp
    };
    this.users.set(id, user);
    return user;
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoriesByUserId(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(category => category.userId === userId);
  }
  
  async getCategoryWithStats(id: number): Promise<CategoryWithStats | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const forms = await this.getFormsByCategoryId(id);
    
    // Calculate stats
    const formCount = forms.length;
    let responseCount = 0;
    let completedResponseCount = 0;
    
    for (const form of forms) {
      const responses = await this.getResponsesByFormId(form.id);
      responseCount += responses.length;
      completedResponseCount += responses.filter(r => r.completedAt !== null).length;
    }
    
    const responseRate = formCount > 0 ? responseCount / formCount : 0;
    const completionRate = responseCount > 0 ? completedResponseCount / responseCount : 0;
    
    return {
      ...category,
      forms,
      formCount,
      responseRate,
      completionRate,
      averageSentiment: 0.75, // Mock value for sentiment analysis
    };
  }
  
  async getAllCategoriesWithStats(userId: number): Promise<CategoryWithStats[]> {
    const categories = await this.getCategoriesByUserId(userId);
    const result: CategoryWithStats[] = [];
    
    for (const category of categories) {
      const categoryWithStats = await this.getCategoryWithStats(category.id);
      if (categoryWithStats) {
        result.push(categoryWithStats);
      }
    }
    
    return result;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const timestamp = new Date();
    const category: Category = {
      id,
      ...insertCategory,
      createdAt: timestamp
    };
    this.categories.set(id, category);
    return category;
  }
  
  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: Category = {
      ...category,
      ...categoryUpdate
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    // First, update all forms in this category to have no category
    const forms = await this.getFormsByCategoryId(id);
    for (const form of forms) {
      await this.updateForm(form.id, { categoryId: null });
    }
    
    return this.categories.delete(id);
  }
  
  // Form operations
  async getForm(id: number): Promise<Form | undefined> {
    return this.forms.get(id);
  }
  
  async getFormWithQuestions(id: number): Promise<FormWithQuestions | undefined> {
    const form = this.forms.get(id);
    if (!form) return undefined;
    
    const formQuestions = await this.getQuestionsByFormId(id);
    return {
      ...form,
      questions: formQuestions
    };
  }
  
  async getFormsByUserId(userId: number): Promise<Form[]> {
    return Array.from(this.forms.values())
      .filter(form => form.userId === userId);
  }
  
  async getFormsByCategoryId(categoryId: number): Promise<Form[]> {
    return Array.from(this.forms.values())
      .filter(form => form.categoryId === categoryId);
  }
  
  async createForm(insertForm: InsertForm): Promise<Form> {
    const id = this.formIdCounter++;
    const timestamp = new Date();
    const form: Form = {
      id,
      ...insertForm,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.forms.set(id, form);
    return form;
  }
  
  async updateForm(id: number, formUpdate: Partial<InsertForm>): Promise<Form | undefined> {
    const form = this.forms.get(id);
    if (!form) return undefined;
    
    const updatedForm: Form = {
      ...form,
      ...formUpdate,
      updatedAt: new Date()
    };
    this.forms.set(id, updatedForm);
    return updatedForm;
  }
  
  async deleteForm(id: number): Promise<boolean> {
    return this.forms.delete(id);
  }
  
  // Question operations
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }
  
  async getQuestionsByFormId(formId: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.formId === formId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.questionIdCounter++;
    const timestamp = new Date();
    const question: Question = {
      id,
      ...insertQuestion,
      createdAt: timestamp
    };
    this.questions.set(id, question);
    return question;
  }
  
  async updateQuestion(id: number, questionUpdate: Partial<InsertQuestion>): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;
    
    const updatedQuestion: Question = {
      ...question,
      ...questionUpdate
    };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }
  
  async deleteQuestion(id: number): Promise<boolean> {
    return this.questions.delete(id);
  }
  
  // Response operations
  async getResponse(id: number): Promise<Response | undefined> {
    return this.responses.get(id);
  }
  
  async getResponseWithAnswers(id: number): Promise<ResponseWithAnswers | undefined> {
    const response = this.responses.get(id);
    if (!response) return undefined;
    
    const responseAnswers = await this.getAnswersByResponseId(id);
    return {
      ...response,
      answers: responseAnswers
    };
  }
  
  async getResponsesByFormId(formId: number): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter(response => response.formId === formId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = this.responseIdCounter++;
    const timestamp = new Date();
    const response: Response = {
      id,
      ...insertResponse,
      completedAt: timestamp,
      createdAt: timestamp
    };
    this.responses.set(id, response);
    return response;
  }
  
  // Answer operations
  async getAnswer(id: number): Promise<Answer | undefined> {
    return this.answers.get(id);
  }
  
  async getAnswersByResponseId(responseId: number): Promise<Answer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.responseId === responseId);
  }
  
  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const id = this.answerIdCounter++;
    const timestamp = new Date();
    const answer: Answer = {
      id,
      ...insertAnswer,
      createdAt: timestamp
    };
    this.answers.set(id, answer);
    return answer;
  }
  
  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getConversationByResponseId(responseId: number): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values())
      .find(conversation => conversation.responseId === responseId);
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const timestamp = new Date();
    const conversation: Conversation = {
      id,
      ...insertConversation,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  async updateConversation(id: number, conversationUpdate: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation: Conversation = {
      ...conversation,
      ...conversationUpdate,
      updatedAt: new Date()
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const timestamp = new Date();
    const message: Message = {
      id,
      ...insertMessage,
      timestamp
    };
    this.messages.set(id, message);
    return message;
  }
  
  // Voice Agent operations
  async getVoiceAgent(id: number): Promise<VoiceAgent | undefined> {
    return this.voiceAgents.get(id);
  }
  
  async getVoiceAgentByFormId(formId: number): Promise<VoiceAgent | undefined> {
    return Array.from(this.voiceAgents.values())
      .find(agent => agent.formId === formId);
  }
  
  async getVoiceAgentWithDetails(id: number): Promise<VoiceAgentWithNodes | undefined> {
    const agent = this.voiceAgents.get(id);
    if (!agent) return undefined;
    
    const nodes = await this.getVoiceAgentNodesByAgentId(id);
    const edges = await this.getVoiceAgentEdgesByAgentId(id);
    const form = agent.formId ? await this.getForm(agent.formId) : undefined;
    
    return {
      ...agent,
      nodes,
      edges,
      form
    };
  }
  
  async createVoiceAgent(insertAgent: InsertVoiceAgent): Promise<VoiceAgent> {
    const id = this.voiceAgentIdCounter++;
    const timestamp = new Date();
    const agent: VoiceAgent = {
      id,
      ...insertAgent,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.voiceAgents.set(id, agent);
    return agent;
  }
  
  async updateVoiceAgent(id: number, agentUpdate: Partial<InsertVoiceAgent>): Promise<VoiceAgent | undefined> {
    const agent = this.voiceAgents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent: VoiceAgent = {
      ...agent,
      ...agentUpdate,
      updatedAt: new Date()
    };
    this.voiceAgents.set(id, updatedAgent);
    return updatedAgent;
  }
  
  async deleteVoiceAgent(id: number): Promise<boolean> {
    // First, delete all associated nodes and edges
    const nodes = await this.getVoiceAgentNodesByAgentId(id);
    for (const node of nodes) {
      await this.deleteVoiceAgentNode(node.id);
    }
    
    const edges = await this.getVoiceAgentEdgesByAgentId(id);
    for (const edge of edges) {
      await this.deleteVoiceAgentEdge(edge.id);
    }
    
    return this.voiceAgents.delete(id);
  }
  
  // Voice Agent Node operations
  async getVoiceAgentNode(id: number): Promise<VoiceAgentNode | undefined> {
    return this.voiceAgentNodes.get(id);
  }
  
  async getVoiceAgentNodesByAgentId(agentId: number): Promise<VoiceAgentNode[]> {
    return Array.from(this.voiceAgentNodes.values())
      .filter(node => node.agentId === agentId);
  }
  
  async createVoiceAgentNode(insertNode: InsertVoiceAgentNode): Promise<VoiceAgentNode> {
    const id = this.voiceAgentNodeIdCounter++;
    const timestamp = new Date();
    const node: VoiceAgentNode = {
      id,
      ...insertNode,
      createdAt: timestamp
    };
    this.voiceAgentNodes.set(id, node);
    return node;
  }
  
  async updateVoiceAgentNode(id: number, nodeUpdate: Partial<InsertVoiceAgentNode>): Promise<VoiceAgentNode | undefined> {
    const node = this.voiceAgentNodes.get(id);
    if (!node) return undefined;
    
    const updatedNode: VoiceAgentNode = {
      ...node,
      ...nodeUpdate
    };
    this.voiceAgentNodes.set(id, updatedNode);
    return updatedNode;
  }
  
  async deleteVoiceAgentNode(id: number): Promise<boolean> {
    return this.voiceAgentNodes.delete(id);
  }
  
  // Voice Agent Edge operations
  async getVoiceAgentEdge(id: number): Promise<VoiceAgentEdge | undefined> {
    return this.voiceAgentEdges.get(id);
  }
  
  async getVoiceAgentEdgesByAgentId(agentId: number): Promise<VoiceAgentEdge[]> {
    return Array.from(this.voiceAgentEdges.values())
      .filter(edge => edge.agentId === agentId);
  }
  
  async createVoiceAgentEdge(insertEdge: InsertVoiceAgentEdge): Promise<VoiceAgentEdge> {
    const id = this.voiceAgentEdgeIdCounter++;
    const timestamp = new Date();
    const edge: VoiceAgentEdge = {
      id,
      ...insertEdge,
      createdAt: timestamp
    };
    this.voiceAgentEdges.set(id, edge);
    return edge;
  }
  
  async deleteVoiceAgentEdge(id: number): Promise<boolean> {
    return this.voiceAgentEdges.delete(id);
  }
  
  // Voice Agent Session operations
  async getVoiceAgentSession(id: number): Promise<VoiceAgentSession | undefined> {
    return this.voiceAgentSessions.get(id);
  }
  
  async getVoiceAgentSessionsByAgentId(agentId: number): Promise<VoiceAgentSession[]> {
    return Array.from(this.voiceAgentSessions.values())
      .filter(session => session.agentId === agentId);
  }
  
  async createVoiceAgentSession(insertSession: InsertVoiceAgentSession): Promise<VoiceAgentSession> {
    const id = this.voiceAgentSessionIdCounter++;
    const timestamp = new Date();
    const session: VoiceAgentSession = {
      id,
      ...insertSession,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.voiceAgentSessions.set(id, session);
    return session;
  }
  
  async updateVoiceAgentSession(id: number, sessionUpdate: Partial<InsertVoiceAgentSession>): Promise<VoiceAgentSession | undefined> {
    const session = this.voiceAgentSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: VoiceAgentSession = {
      ...session,
      ...sessionUpdate,
      updatedAt: new Date()
    };
    this.voiceAgentSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Generate LangGraph agent from form
  async generateVoiceAgentFromForm(formId: number): Promise<VoiceAgentWithNodes | undefined> {
    const form = await this.getFormWithQuestions(formId);
    if (!form) return undefined;
    
    // Create a new voice agent for this form
    const agent = await this.createVoiceAgent({
      formId: form.id,
      name: `${form.title} Voice Agent`,
      description: `Voice agent for ${form.title} form`,
      model: "grok-2-1212",  // Default to Groq's model
      temperature: 0.7,
      maxTokens: 1024,
      isActive: true,
      settings: {
        voiceType: "balanced",
        speakingRate: 1.0,
        useMemory: true,
        followUpQuestions: true
      }
    });
    
    // Create START node (opening message)
    const startNode = await this.createVoiceAgentNode({
      agentId: agent.id,
      nodeType: "open",
      nodeId: "START",
      content: `Welcome to the ${form.title} form. I'll guide you through the questions. You can respond with your voice or by typing. Let's begin.`,
      settings: {
        persona: "friendly",
        allowSkip: false
      }
    });
    
    // Create question nodes for each question in the form
    const questionNodes = [];
    for (const question of form.questions) {
      const questionNode = await this.createVoiceAgentNode({
        agentId: agent.id,
        nodeType: "question",
        nodeId: `QUESTION_${question.id}`,
        questionId: question.id,
        content: question.text,
        settings: {
          questionType: question.type,
          required: question.required || false,
          validation: question.validation || {},
          rephrasing: ["Could you please answer that question?", "I need your response to continue."]
        }
      });
      questionNodes.push(questionNode);
    }
    
    // Create END node (closing message)
    const endNode = await this.createVoiceAgentNode({
      agentId: agent.id,
      nodeType: "close",
      nodeId: "END",
      content: `Thank you for completing the ${form.title} form. Your responses have been recorded.`,
      settings: {
        followUp: false
      }
    });
    
    // Create edges to connect the nodes
    // START -> First Question
    if (questionNodes.length > 0) {
      await this.createVoiceAgentEdge({
        agentId: agent.id,
        sourceNodeId: startNode.nodeId,
        targetNodeId: questionNodes[0].nodeId,
        condition: "default"
      });
    } else {
      // If no questions, connect START directly to END
      await this.createVoiceAgentEdge({
        agentId: agent.id,
        sourceNodeId: startNode.nodeId,
        targetNodeId: endNode.nodeId,
        condition: "default"
      });
    }
    
    // Connect questions in sequence
    for (let i = 0; i < questionNodes.length - 1; i++) {
      await this.createVoiceAgentEdge({
        agentId: agent.id,
        sourceNodeId: questionNodes[i].nodeId,
        targetNodeId: questionNodes[i + 1].nodeId,
        condition: "valid"
      });
    }
    
    // Last Question -> END
    if (questionNodes.length > 0) {
      await this.createVoiceAgentEdge({
        agentId: agent.id,
        sourceNodeId: questionNodes[questionNodes.length - 1].nodeId,
        targetNodeId: endNode.nodeId,
        condition: "valid"
      });
    }
    
    // Return the complete agent with nodes and edges
    return this.getVoiceAgentWithDetails(agent.id);
  }

  // Add test data for development
  async seedTestData() {
    // Create test user
    const user = await this.createUser({
      username: "testuser",
      password: "password123",
      displayName: "Sarah Wilson",
      email: "sarah@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    // Create categories
    const customerCategory = await this.createCategory({
      userId: user.id,
      name: "Customer Feedback",
      description: "Forms for gathering customer input and feedback",
      color: "#3B82F6",
      icon: "star"
    });
    
    const hrCategory = await this.createCategory({
      userId: user.id,
      name: "Human Resources",
      description: "Forms related to HR processes and recruiting",
      color: "#8B5CF6",
      icon: "users"
    });
    
    const eventCategory = await this.createCategory({
      userId: user.id,
      name: "Events",
      description: "Forms for event planning, feedback, and management",
      color: "#EC4899",
      icon: "calendar"
    });
    
    const marketingCategory = await this.createCategory({
      userId: user.id,
      name: "Marketing",
      description: "Forms for marketing surveys and campaigns",
      color: "#10B981",
      icon: "megaphone"
    });
    
    // Create a few forms
    const form1 = await this.createForm({
      userId: user.id,
      categoryId: customerCategory.id,
      title: "Customer Satisfaction",
      description: "Please provide feedback about your recent experience with our customer service team.",
      isActive: true,
      emailNotificationEnabled: true,
      emailRecipients: "admin@example.com, manager@example.com",
      emailSubject: "New Customer Feedback Submission",
      emailTemplate: `Hi there,

A new customer feedback form has been submitted.

Form: {{formName}}
Respondent: {{respondentName}} ({{respondentEmail}})
Date: {{submissionDate}}

View the full response: {{responseLink}}

Thanks,
Voice Form Agent`
    });
    
    // Add questions to form1
    await this.createQuestion({
      formId: form1.id,
      text: "How would you rate your overall experience?",
      type: "multiple_choice",
      order: 1,
      options: ["Excellent", "Good", "Average", "Poor"],
      required: true
    });
    
    await this.createQuestion({
      formId: form1.id,
      text: "What aspects of our service could be improved?",
      type: "text",
      order: 2,
      options: null,
      required: true
    });
    
    // Create another form in the same category
    const form2 = await this.createForm({
      userId: user.id,
      categoryId: customerCategory.id,
      title: "Product Feedback",
      description: "Help us improve our products with your feedback",
      isActive: true,
      emailNotificationEnabled: true,
      emailRecipients: "product@example.com",
      emailSubject: "New Product Feedback",
      emailTemplate: "A new product feedback form has been submitted."
    });
    
    // HR category form
    const form3 = await this.createForm({
      userId: user.id,
      categoryId: hrCategory.id,
      title: "Job Application",
      description: "Apply for open positions at our company",
      isActive: true,
      emailNotificationEnabled: true,
      emailRecipients: "hr@example.com",
      emailSubject: "New Job Application",
      emailTemplate: "A new job application has been submitted."
    });
    
    // Event category form
    const form4 = await this.createForm({
      userId: user.id,
      categoryId: eventCategory.id,
      title: "Event Feedback",
      description: "Share your thoughts about our recent event",
      isActive: true,
      emailNotificationEnabled: false,
      emailRecipients: null,
      emailSubject: null,
      emailTemplate: null
    });
    
    // Marketing category form
    const form5 = await this.createForm({
      userId: user.id,
      categoryId: marketingCategory.id,
      title: "Marketing Survey",
      description: "Help us understand your preferences",
      isActive: true,
      emailNotificationEnabled: false,
      emailRecipients: null,
      emailSubject: null,
      emailTemplate: null
    });
    
    // Add some responses to the first form
    const response1 = await this.createResponse({
      formId: form1.id,
      respondentName: "John Doe",
      respondentEmail: "john.doe@example.com"
    });
    
    await this.createAnswer({
      responseId: response1.id,
      questionId: 1, // Assumes the first question has ID 1
      answerText: "Excellent"
    });
    
    await this.createAnswer({
      responseId: response1.id,
      questionId: 2, // Assumes the second question has ID 2
      answerText: "The customer service was great, but I think the website could be more user-friendly."
    });
    
    const response2 = await this.createResponse({
      formId: form1.id,
      respondentName: "Jane Smith",
      respondentEmail: "jane.smith@example.com"
    });
    
    await this.createAnswer({
      responseId: response2.id,
      questionId: 1,
      answerText: "Good"
    });
    
    await this.createAnswer({
      responseId: response2.id,
      questionId: 2,
      answerText: "I would like to see more product options available."
    });
    
    const response3 = await this.createResponse({
      formId: form1.id,
      respondentName: "Robert Johnson",
      respondentEmail: "robert.j@example.com"
    });
    
    await this.createAnswer({
      responseId: response3.id,
      questionId: 1,
      answerText: "Excellent"
    });
    
    await this.createAnswer({
      responseId: response3.id,
      questionId: 2,
      answerText: "Everything was perfect, no improvements needed!"
    });
    
    // Add a response to another form
    const response4 = await this.createResponse({
      formId: form2.id,
      respondentName: "Mike Brown",
      respondentEmail: "mike.b@example.com"
    });
  }
}

import { DatabaseStorage } from "./databaseStorage";
import runMigration from "./migrate";

// Create storage instance but don't initialize yet
const dbStorage = new DatabaseStorage();

// Export an async function to initialize the storage
export async function initializeStorage() {
  try {
    // Run migrations before using the database
    await runMigration();
    // Seed test data after migrations are complete
    await dbStorage.seedTestData();
    console.log("Database initialized successfully with test data");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// Export the storage instance
export const storage = dbStorage;
