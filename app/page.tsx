import Asistente from './componentes/Asistente';
import DelCorreo from './componentes/DelCorreo';
import ListaTareas from './componentes/ListaTareas';

export default function Page() {
  return (
    <main className="pagina">
      <header className="cabecera">
        <h1>Tareas Pro</h1>
        <p className="apagado">Semana 13 · Integración de IA (I)</p>
      </header>

      <div className="rejilla">
        <section className="columna">
          <ListaTareas />
        </section>

        <section className="columna">
          <DelCorreo />
          <Asistente />
        </section>
      </div>
    </main>
  );
}
