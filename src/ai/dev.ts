import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-space-services.ts';
import '@/ai/flows/chat-determine-tool-use.ts';