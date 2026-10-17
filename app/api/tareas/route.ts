import { listar } from '../../../lib/tareas';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(listar());
}
