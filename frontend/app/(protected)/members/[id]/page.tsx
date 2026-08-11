"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ds/PageHeader";
import { SectionCard } from "@/components/ds/SectionCard";
import { DataRow } from "@/components/ds/DataRow";
import { Field } from "@/components/ds/Field";
import { StatusBadge } from "@/components/ds/StatusBadge";
import { Moldura } from "@/components/ds/Moldura";
import { notificar } from "@/components/ds/toast-helpers";
import { membersService, Member } from "@/services/members.service";
import { selectionService, Application } from "@/services/selection.service";
import {
  MEMBER_STATUS_LABEL,
  DEPARTMENT_LABEL,
  POSITION_LABEL,
  label,
} from "@/lib/labels";
import { InterestsTags } from "./_components/InterestsTags";
import { ApplicationCard } from "./_components/ApplicationCard";

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "CANDIDATE", "ALUMNI"];
const DEPARTMENT_OPTIONS = ["PEOPLE", "MARKETING", "PROJECTS", "EDUCATIONAL"];
const POSITION_OPTIONS = ["MEMBER", "HEAD", "DIRECTOR", "PRESIDENT"];
const GENDER_OPTIONS = ["Masculino", "Feminino", "Não-binário", "Prefiro não informar"];
const RACE_OPTIONS = ["Branco", "Pardo", "Preto", "Amarelo", "Indígena", "Prefiro não informar"];

// Um lugar só. Antes eram duas strings soltas (inputCls e selectCls) que
// existiam porque o componente Input nunca chegou nesta página.
const CAMPO =
  "h-10 w-full rounded-field border border-border-interactive bg-surface-sunken px-3 text-sm text-fg focus:border-accent focus:outline-none";

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

  useEffect(() => {
    // localStorage só existe no cliente — SSR-safe (CLAUDE.md, regra técnica 2).
    const role = localStorage.getItem("x-user-role") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanEdit(["ADMIN", "PEOPLE"].includes(role));
  }, []);

  useEffect(() => {
    membersService
      .getMemberById(memberId)
      .then(setMember)
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
      notificar.erro("Não foi possível exportar o PDF");
    }
  };

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

  const salvar = (payload: Partial<Member>) =>
    membersService.updateMember(memberId, payload).then((m) => {
      if (m) setMember(m);
      return m ?? undefined;
    });

  return (
    <div className="space-y-8">
      <PageHeader
        label="MEMBRO"
        title={member.name}
        subtitle={member.email}
        icon={User}
        onBack={() => router.push("/members")}
        actions={
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText size={16} aria-hidden="true" />
            Exportar PDF
          </Button>
        }
      />

      <SectionCard label="IDENTIFICAÇÃO" editable={canEdit} values={member} onSave={salvar}>
        {({ editing, values, set, errors }) =>
          editing ? (
            <>
              <Field label="Nome" error={errors.name}>
                <input className={CAMPO} value={values.name ?? ""} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input type="email" className={CAMPO} value={values.email ?? ""} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="RA">
                <input className={CAMPO} value={values.universityId ?? ""} onChange={(e) => set("universityId", e.target.value)} />
              </Field>
              <Field label="Status">
                <Select value={values.status ?? ""} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className={CAMPO}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{label(MEMBER_STATUS_LABEL, s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Departamento">
                <Select value={values.department ?? "nenhum"} onValueChange={(v) => set("department", v === "nenhum" ? "" : v)}>
                  <SelectTrigger className={CAMPO}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">— Nenhum —</SelectItem>
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>{label(DEPARTMENT_LABEL, d)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Cargo">
                <Select value={values.position ?? "nenhum"} onValueChange={(v) => set("position", v === "nenhum" ? "" : v)}>
                  <SelectTrigger className={CAMPO}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">— Nenhum —</SelectItem>
                    {POSITION_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>{label(POSITION_LABEL, p)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Ingressou em">
                <input type="date" className={CAMPO} value={toInputDate(values.joinedAt)} onChange={(e) => set("joinedAt", e.target.value)} />
              </Field>
              <Field label="Saiu em">
                <input type="date" className={CAMPO} value={toInputDate(values.leftAt)} onChange={(e) => set("leftAt", e.target.value)} />
              </Field>
            </>
          ) : (
            <>
              <DataRow label="Nome" value={values.name} />
              <DataRow label="Email" value={values.email} />
              <DataRow label="RA" value={values.universityId} />
              <DataRow label="Status" value={<StatusBadge status={values.status} label={label(MEMBER_STATUS_LABEL, values.status)} />} />
              <DataRow label="Departamento" value={label(DEPARTMENT_LABEL, values.department)} />
              <DataRow label="Cargo" value={label(POSITION_LABEL, values.position)} />
              <DataRow label="Ingressou em" value={formatDate(values.joinedAt)} />
              <DataRow label="Saiu em" value={formatDate(values.leftAt)} />
            </>
          )
        }
      </SectionCard>

      <SectionCard label="DEMOGRÁFICOS" editable={canEdit} values={member} onSave={salvar}>
        {({ editing, values, set }) =>
          editing ? (
            <>
              <Field label="Gênero">
                <Select value={values.gender ?? "vazio"} onValueChange={(v) => set("gender", v === "vazio" ? "" : v)}>
                  <SelectTrigger className={CAMPO}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vazio">— Não informado —</SelectItem>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Raça/Cor">
                <Select value={values.race ?? "vazio"} onValueChange={(v) => set("race", v === "vazio" ? "" : v)}>
                  <SelectTrigger className={CAMPO}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vazio">— Não informado —</SelectItem>
                    {RACE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="LGBTQIA+">
                <Select
                  value={values.isLgbtqia == null ? "vazio" : values.isLgbtqia ? "sim" : "nao"}
                  onValueChange={(v) => set("isLgbtqia", v === "vazio" ? null : v === "sim")}
                >
                  <SelectTrigger className={CAMPO}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vazio">— Não informado —</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </>
          ) : (
            <>
              <DataRow label="Gênero" value={values.gender} />
              <DataRow label="Raça/Cor" value={values.race} />
              <DataRow
                label="LGBTQIA+"
                value={values.isLgbtqia == null ? undefined : values.isLgbtqia ? "Sim" : "Não"}
              />
            </>
          )
        }
      </SectionCard>

      <SectionCard label="ÁREAS DE INTERESSE" editable={canEdit} values={member} onSave={salvar}>
        {({ editing, values, set }) => (
          <>
            <InterestsTags
              interests={values.interests ?? []}
              editing={editing}
              onChange={(tags) => set("interests", tags)}
            />
            {!editing && (values.interests ?? []).length === 0 && (
              <p className="text-xs opacity-40">
                Nenhum interesse cadastrado. Clique em &quot;Editar&quot; para adicionar.
              </p>
            )}
          </>
        )}
      </SectionCard>

      <Moldura shadow="ciano" interactive fill="educational">
        <Link
          href={`/members/${memberId}/pdi`}
          className="flex items-center justify-between gap-4 p-6 focus:outline-none"
        >
          <div>
            <h2 className="font-heading text-lg font-bold">Plano de Desenvolvimento Individual</h2>
            <p className="mt-1 text-sm opacity-80">
              Acesse e edite o PDI deste membro, exporte em PDF ou CSV com o histórico de revisões.
            </p>
          </div>
          <ArrowRight size={20} aria-hidden="true" className="shrink-0" />
        </Link>
      </Moldura>

      <SectionCard label="PROCESSOS SELETIVOS" values={{}}>
        {() =>
          loadingApps ? (
            <p className="text-sm text-fg-muted">Carregando histórico...</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-fg-muted">
              Nenhum processo seletivo registrado para este membro.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          )
        }
      </SectionCard>
    </div>
  );
}
