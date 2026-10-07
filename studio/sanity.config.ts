import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {vinyl} from './schemaTypes/vinyl';
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'ovzh9fkm';
if (!projectId) throw new Error('Set SANITY_STUDIO_PROJECT_ID in studio/.env before starting Studio.');
export default defineConfig({name:'slow-grooves',title:'Slow Grooves — Record Collection',projectId,dataset:process.env.SANITY_STUDIO_DATASET || 'production',plugins:[structureTool()],schema:{types:[vinyl]}});
