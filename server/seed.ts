// server/seed.ts
import 'dotenv/config';
import mongoose, { Schema, Document } from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in server/.env');
  process.exit(1);
}

// --- 1) Define your TS interfaces ---
interface ISnippet extends Document {
  title: string;
  description: string;
  language: string;
  code: string;
}
interface IFolder extends Document {
  name: string;
  snippets: mongoose.Types.ObjectId[];
}

// --- 2) Inline schemas & models ---
const SnippetSchema = new Schema<ISnippet>({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  language:    { type: String, default: '' },
  code:        { type: String, default: '' },
});
const FolderSchema = new Schema<IFolder>({
  name:     { type: String, required: true },
  snippets: [{ type: Schema.Types.ObjectId, ref: 'Snippet' }],
});
const Snippet = mongoose.model<ISnippet>('Snippet', SnippetSchema);
const Folder  = mongoose.model<IFolder>('Folder', FolderSchema);

async function seed() {
  // connect to the same "codeTrove" DB your API uses
  await mongoose.connect(MONGO_URI, { dbName: 'codeTrove' });

  // wipe old data
  await Promise.all([Snippet.deleteMany({}), Folder.deleteMany({})]);

  // create folders
  const folderNames = ['Utilities', 'Algorithms', 'UI Tricks', 'API Calls'];
  const folders = await Folder.insertMany(
    folderNames.map((name) => ({ name, snippets: [] }))
  );

  // **replace Faker** with a small hand-picked list:
  const sampleSnippets = [
    {
      title: 'Hello World',
      description: 'Log "Hello World" to the console',
      language: 'js',
      code: `console.log("Hello World");`,
    },
    {
      title: 'Fetch JSON',
      description: 'Fetch data from /api/data and log it',
      language: 'js',
      code: `fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`,
    },
    {
      title: 'Debounce Function',
      description: 'Basic debounce utility in TypeScript',
      language: 'ts',
      code: `export function debounce(fn: () => void, ms = 300) {
  let timer: NodeJS.Timeout;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}`,
    },
    {
      title: 'Sleep Helper',
      description: 'Pause execution in Python',
      language: 'py',
      code: `import time

def sleep(seconds):
    time.sleep(seconds)
    print(f"Slept for {seconds} seconds")`,
    },
  ];

  // insert those
  const snippets = await Promise.all(
    sampleSnippets.map((s) => Snippet.create(s))
  );

  // randomly assign each to a folder
  for (const snip of snippets) {
    const f = folders[Math.floor(Math.random() * folders.length)];
    f.snippets.push(snip._id);
  }
  await Promise.all(folders.map((f) => f.save()));

  console.log(`Seeded ${snippets.length} real‐looking snippets into ${folders.length} folders`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
