"use client";

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/LegacyButton";
import { Card } from "@/components/ui/Card";
import {
  FileText,
  User,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Pencil,
  X,
  Save,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { membersService, Member } from "@/services/members.service";
import { selectionService, Application } from "@/services/selection.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MEMBER_STATUS_LABEL,
  DEPARTMENT_LABEL,
  POSITION_LABEL,
  label,
} from "@/lib/labels";
import { InterestsTags } from "./_components/InterestsTags";
import { ApplicationCard } from "./_components/ApplicationCard";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEPT_OPTIONS = ["", "PEOPLE", "MARKETING", "PROJECTS", "EDUCATIONAL"];
const POS_OPTIONS = ["", "MEMBER", "HEAD", "DIRECTOR", "PRESIDENT"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "CANDIDATE", "ALUMNI"];
const GENDER_OPTIONS = ["", "Masculino", "Feminino", "Não-binário", "Prefiro não informar"];
const RACE_OPTIONS = ["", "Branco", "Pardo", "Preto", "Amarelo", "Indígena", "Prefiro não informar"];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-accent font-semibold min-w-[120px] shrink-0 pt-0.5">
        {label}:
      </span>
      <span className="text-fg">
        {value ?? <span className="opacity-40">—</span>}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-accent uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "bg-surface-sunken border border-border-interactive text-fg text-sm rounded-field px-3 py-2 focus:outline-none focus:border-accent w-full";

const selectCls =
  "appearance-none bg-surface-sunken border border-border-interactive text-fg text-sm rounded-field px-3 py-2 focus:outline-none focus:border-accent w-full cursor-pointer";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

function toInputDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const memberId = resolvedParams.id;
  const router = useRouter();

  const [member, setMember] = useState<Member | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingMember, setLoadingMember] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Member>>({});

  useEffect(() => {
    // localStorage só existe no cliente — SSR-safe (CLAUDE.md, regra técnica 2).
    const role = localStorage.getItem("x-user-role") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanEdit(["ADMIN", "PEOPLE"].includes(role));
  }, []);

  useEffect(() => {
    membersService
      .getMemberById(memberId)
      .then((m) => {
        setMember(m);
        if (m) setForm(m);
      })
      .catch(() => {})
      .finally(() => setLoadingMember(false));

    selectionService
      .getMemberApplications(memberId)
      .then(setApplications)
      .catch((err) => {
        const status = err?.response?.status;
        if (status !== 404) console.error("getMemberApplications:", status, err?.message);
      })
      .finally(() => setLoadingApps(false));
  }, [memberId]);

  const handleExportPDF = async () => {
    try {
      await membersService.exportPDF(memberId);
    } catch {
      alert("Erro ao exportar PDF.");
    }
  };

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    try {
      const updated = await membersService.updateMember(memberId, {
        name: form.name,
        email: form.email,
        department: form.department,
        position: form.position,
        status: form.status,
        gender: form.gender,
        race: form.race,
        isLgbtqia: form.isLgbtqia,
        universityId: form.universityId,
        interests: form.interests ?? [],
        joinedAt: form.joinedAt,
        leftAt: form.leftAt,
      });
      if (updated) {
        setMember(updated);
        setForm(updated);
      }
      setEditing(false);
    } catch {
      alert("Erro ao salvar. Verifique as permissões.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (member) setForm(member);
    setEditing(false);
  };

  const set = <K extends keyof Member>(k: K, v: Member[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  if (loadingMember) {
    return (
      <div className="p-8 text-fg opacity-70">
        Carregando perfil...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-danger font-bold">
        Membro não encontrado.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 w-full max-w-5xl mx-auto flex flex-col gap-8"
    >
      {/* ── Back ── */}
      <button
        onClick={() => router.push("/members")}
        className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Membros
      </button>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <User size={32} className="text-accent" />
          <div className="flex flex-col gap-0.5">
            <h1 className="font-bold text-fg">
              {editing ? (
                <input
                  value={form.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls + " text-2xl font-bold"}
                />
              ) : (
                member.name
              )}
            </h1>
            <p className="text-fg-muted text-sm">
              {member.email}
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {editing ? (
            <>
              <Button onClick={handleCancel} variant="secondary" disabled={saving}>
                <X size={16} />
                Cancelar
              </Button>
              <Button onClick={handleSave} variant="primary" disabled={saving}>
                <Save size={16} />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => setEditing(true)} variant="secondary">
                    <Pencil size={16} />
                    Editar
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleExportPDF} variant="primary">
                  <FileText size={16} />
                  Exportar PDF
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 1: Informações Básicas + Demográficos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="flex flex-col gap-4 h-full">
            <h2 className="text-xl font-bold border-b border-border pb-2">
              Informações Básicas
            </h2>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <Field label="Status">
                    <select
                      value={form.status ?? ""}
                      onChange={(e) => set("status", e.target.value)}
                      className={selectCls}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {label(MEMBER_STATUS_LABEL, s)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Departamento">
                    <select
                      value={form.department ?? ""}
                      onChange={(e) => set("department", e.target.value || null)}
                      className={selectCls}
                    >
                      {DEPT_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d ? label(DEPARTMENT_LABEL, d) : "— Nenhum —"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Cargo">
                    <select
                      value={form.position ?? ""}
                      onChange={(e) => set("position", e.target.value || null)}
                      className={selectCls}
                    >
                      {POS_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p ? label(POSITION_LABEL, p) : "— Nenhum —"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email ?? ""}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="RA">
                    <input
                      type="text"
                      value={form.universityId ?? ""}
                      onChange={(e) => set("universityId", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Data de ingresso">
                    <input
                      type="date"
                      value={toInputDate(form.joinedAt)}
                      onChange={(e) => set("joinedAt", e.target.value || null)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Data de saída">
                    <input
                      type="date"
                      value={toInputDate(form.leftAt)}
                      onChange={(e) => set("leftAt", e.target.value || null)}
                      className={inputCls}
                    />
                  </Field>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <Row
                    label="Status"
                    value={<Badge status={member.status} label={label(MEMBER_STATUS_LABEL, member.status)} />}
                  />
                  <Row label="Departamento" value={label(DEPARTMENT_LABEL, member.department)} />
                  <Row label="Cargo" value={label(POSITION_LABEL, member.position)} />
                  <Row label="Email" value={member.email} />
                  <Row label="RA" value={member.universityId} />
                  <Row label="Ingressou em" value={formatDate(member.joinedAt)} />
                  <Row label="Saiu em" value={formatDate(member.leftAt)} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Dados Demográficos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="flex flex-col gap-4 h-full">
            <h2 className="text-xl font-bold border-b border-border pb-2">
              Dados Demográficos
            </h2>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <Field label="Gênero">
                    <select
                      value={form.gender ?? ""}
                      onChange={(e) => set("gender", e.target.value || null)}
                      className={selectCls}
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g || "— Não informado —"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Raça/Cor">
                    <select
                      value={form.race ?? ""}
                      onChange={(e) => set("race", e.target.value || null)}
                      className={selectCls}
                    >
                      {RACE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r || "— Não informado —"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="LGBTQIA+">
                    <select
                      value={
                        form.isLgbtqia == null
                          ? ""
                          : form.isLgbtqia
                          ? "true"
                          : "false"
                      }
                      onChange={(e) =>
                        set(
                          "isLgbtqia",
                          e.target.value === ""
                            ? null
                            : e.target.value === "true",
                        )
                      }
                      className={selectCls}
                    >
                      <option value="">— Não informado —</option>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  </Field>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <Row label="Gênero" value={member.gender} />
                  <Row label="Raça/Cor" value={member.race} />
                  <Row
                    label="LGBTQIA+"
                    value={
                      member.isLgbtqia == null
                        ? null
                        : member.isLgbtqia
                        ? "Sim"
                        : "Não"
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>

      {/* ── Interesses ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold border-b border-border pb-2 flex items-center gap-2">
            <Tag size={18} className="text-accent" />
            Áreas de Interesse
          </h2>
          <InterestsTags
            interests={editing ? (form.interests ?? []) : (member.interests ?? [])}
            editing={editing}
            onChange={(tags) => set("interests", tags)}
          />
          {!editing && (member.interests ?? []).length === 0 && (
            <p className="text-xs opacity-40">
              Nenhum interesse cadastrado. Clique em &quot;Editar&quot; para adicionar.
            </p>
          )}
        </Card>
      </motion.div>

      {/* ── PDI ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card variant="educational" className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-xl font-bold">
              Plano de Desenvolvimento Individual (PDI)
            </h2>
            <Link
              href={`/members/${memberId}/pdi`}
              className="text-xs font-bold flex items-center gap-1 hover:underline"
            >
              Abrir PDI <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-sm opacity-70">
            Acesse e edite o PDI deste membro, exporte em PDF ou CSV com o
            histórico de revisões.
          </p>
        </Card>
      </motion.div>

      {/* ── Processos Seletivos ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <ClipboardList
              size={20}
              className="text-accent"
            />
            <h2 className="text-xl font-bold">Processos Seletivos</h2>
          </div>

          {loadingApps ? (
            <p className="text-sm opacity-60">Carregando histórico...</p>
          ) : applications.length === 0 ? (
            <p className="text-sm opacity-50">
              Nenhum processo seletivo registrado para este membro.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
