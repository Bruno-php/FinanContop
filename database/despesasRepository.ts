import { Despesa } from "../types/despesa";
import { db } from "./database";

export const despesasRepository = {
  // Inserir registro
  adicionar: (despesa: Omit<Despesa, "id">) => {
    const statement = db.prepareSync(
      "INSERT INTO despesas (titulo, valor, categoria, descricao, data) VALUES ($titulo, $valor, $categoria, $descricao, $data)",
    );
    try {
      const result = statement.executeSync({
        $titulo: despesa.titulo,
        $valor: despesa.valor,
        $categoria: despesa.categoria,
        $descricao: despesa.descricao || "",
        $data: despesa.data,
      });
      return result.lastInsertRowId;
    } finally {
      statement.finalizeSync();
    }
  },

  // Ler todos os registros
  buscarTodas: (): Despesa[] => {
    return db.getAllSync<Despesa>("SELECT * FROM despesas ORDER BY id DESC");
  },

  // Editar registro
  atualizar: (despesa: Despesa) => {
    const statement = db.prepareSync(
      "UPDATE despesas SET titulo = $titulo, valor = $valor, categoria = $categoria, descricao = $descricao, data = $data WHERE id = $id",
    );
    try {
      statement.executeSync({
        $id: despesa.id!,
        $titulo: despesa.titulo,
        $valor: despesa.valor,
        $categoria: despesa.categoria,
        $descricao: despesa.descricao || "",
        $data: despesa.data,
      });
    } finally {
      statement.finalizeSync();
    }
  },

  // Excluir registro
  deletar: (id: number) => {
    const statement = db.prepareSync("DELETE FROM despesas WHERE id = $id");
    try {
      statement.executeSync({ $id: id });
    } finally {
      statement.finalizeSync();
    }
  },
};
