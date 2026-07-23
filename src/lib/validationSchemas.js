import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido.")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Informe sua senha."),
});

export const inviteUserSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(3, "Informe o nome completo.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("Informe um e-mail válido.")
    .transform((value) => value.toLowerCase()),
  papel: z.enum(["rh", "colaborador"], {
    message: "Selecione um papel válido.",
  }),
});

export const firstAccessSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const teamSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Informe o nome do time.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),
  descricao: z
    .string()
    .trim()
    .transform((value) => value || null),
});

export const competencyTemplateSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do template."),
  competencias: z.array(
    z.object({
      id: z.string().optional(),
      nome: z.string().trim().min(1, "Informe o nome da competência."),
      descricao: z.string().trim().min(1, "Informe a descrição da competência."),
    })
  ).min(1, "Adicione pelo menos uma competência."),
});

export const cycleSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do ciclo.").max(255, "O nome deve ter no máximo 255 caracteres."),
  templateId: z.string().min(1, "Selecione um template."),
  dataInicio: z.string().min(1, "Informe a data de início."),
  dataFim: z.string().min(1, "Informe a data de término."),
  timeIds: z.array(z.string().uuid("Time inválido.")).min(1, "Selecione ao menos um time."),
}).refine((data) => {
  if (!data.dataInicio || !data.dataFim) return true;
  return data.dataFim >= data.dataInicio;
}, {
  message: "A data de término não pode anteceder a data de início.",
  path: ["dataFim"]
});

export const evaluationSchema = z.object({
  atribuicaoId: z.string().min(1, "Selecione a atribuição."),
  notas: z.record(z.string(), z.coerce.number().min(1).max(5)),
  pontosFortes: z.string().trim().max(1000, "O texto não pode exceder 1000 caracteres."),
  pontosMelhoria: z.string().trim().max(1000, "O texto não pode exceder 1000 caracteres."),
});
