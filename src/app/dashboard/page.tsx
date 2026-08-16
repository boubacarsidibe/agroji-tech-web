"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createAnnonce,
  deleteAnnonce,
  listMesAnnonces,
  updateAnnonce,
  uploadPhoto,
  ApiError,
  type Categorie,
  type MonAnnonce,
  type StatutAnnonce,
} from "@/lib/api";
import { getSession, subscribeToAuthChanges } from "@/lib/auth";
import { categorieColors } from "@/lib/colors";

const categories: { value: Categorie; label: string }[] = [
  { value: "FRUITIER", label: "Fruitier" },
  { value: "FORESTIER", label: "Forestier" },
  { value: "MARAICHER", label: "Maraicher" },
  { value: "ORNEMENTAL", label: "Ornemental" },
];

const categorieLabels: Record<Categorie, string> = {
  FRUITIER: "Fruitier",
  FORESTIER: "Forestier",
  MARAICHER: "Maraicher",
  ORNEMENTAL: "Ornemental",
};

const statutLabels: Record<StatutAnnonce, string> = {
  DISPONIBLE: "Disponible",
  RUPTURE: "Rupture",
  ARCHIVEE: "Archivee",
};

const statutColors: Record<StatutAnnonce, string> = {
  DISPONIBLE: "bg-[#e6ecdd] text-[#8f3f1c]",
  RUPTURE: "bg-[#fdecea] text-[#7a1f14]",
  ARCHIVEE: "bg-[#ebdfc3] text-[#4a3f33]",
};

const inputClass =
  "rounded-lg border border-[#d9c7a3] px-4 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#241a12] outline-none focus:border-[#b8552b]";
const labelClass = "font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#241a12]";

export default function DashboardPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToAuthChanges, getSession, () => null);
  const isProducteur = session?.utilisateur.roles.includes("PRODUCTEUR") ?? false;

  const [annonces, setAnnonces] = useState<MonAnnonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [espece, setEspece] = useState("");
  const [variete, setVariete] = useState("");
  const [categorie, setCategorie] = useState<Categorie>("FRUITIER");
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [ville, setVille] = useState("");
  const [region, setRegion] = useState("");
  const [photos, setPhotos] = useState<string[]>([""]);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingPhotosId, setEditingPhotosId] = useState<string | null>(null);
  const [editPhotos, setEditPhotos] = useState<string[]>([""]);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);

  const [uploadingCreate, setUploadingCreate] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  function handlePhotoChange(list: string[], setList: (v: string[]) => void, index: number, value: string) {
    setList(list.map((p, i) => (i === index ? value : p)));
  }

  function handleAddPhotoField(list: string[], setList: (v: string[]) => void) {
    if (list.length < 5) setList([...list, ""]);
  }

  function handleRemovePhotoField(list: string[], setList: (v: string[]) => void, index: number) {
    setList(list.filter((_, i) => i !== index));
  }

  async function handleFileUpload(
    file: File,
    list: string[],
    setList: (v: string[]) => void,
    setUploading: (v: boolean) => void,
    setUploadError: (v: string | null) => void
  ) {
    if (!session) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadPhoto(session.token, file);
      const filled = list.filter((p) => p.trim());
      setList(filled.length < 5 ? [...filled, url] : filled);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Envoi de la photo impossible.");
    } finally {
      setUploading(false);
    }
  }

  function handleStartEditPhotos(annonce: MonAnnonce) {
    setEditPhotos(annonce.photos.length > 0 ? annonce.photos : [""]);
    setPhotosError(null);
    setEditingPhotosId(annonce.id);
  }

  async function handleSavePhotos(id: string) {
    if (!session) return;
    setSavingPhotos(true);
    setPhotosError(null);
    try {
      const updated = await updateAnnonce(session.token, id, {
        photos: editPhotos.map((p) => p.trim()).filter(Boolean),
      });
      setAnnonces((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setEditingPhotosId(null);
    } catch (err) {
      setPhotosError(err instanceof ApiError ? err.message : "Mise a jour des photos impossible.");
    } finally {
      setSavingPhotos(false);
    }
  }

  useEffect(() => {
    if (session === null) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);
      listMesAnnonces(session.token)
        .then(setAnnonces)
        .catch(() => setError("Impossible de charger vos annonces pour le moment."))
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(timeout);
  }, [session]);

  useEffect(() => {
    if (session === null) router.push("/login");
    else if (!isProducteur) router.push("/");
  }, [session, isProducteur, router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setCreating(true);
    setFormError(null);

    try {
      const created = await createAnnonce(session.token, {
        espece,
        variete: variete || undefined,
        categorie,
        quantite,
        prixUnitaire,
        ville: ville || undefined,
        region: region || undefined,
        photos: photos.map((p) => p.trim()).filter(Boolean),
      });
      setAnnonces((prev) => [created, ...prev]);
      setEspece("");
      setVariete("");
      setQuantite(1);
      setPrixUnitaire(0);
      setVille("");
      setRegion("");
      setPhotos([""]);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Impossible de creer l'annonce.");
    } finally {
      setCreating(false);
    }
  }

  async function handleStatutChange(id: string, statut: StatutAnnonce) {
    if (!session) return;
    setActionId(id);
    try {
      const updated = await updateAnnonce(session.token, id, { statut });
      setAnnonces((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Mise a jour impossible.");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!session) return;
    setActionId(id);
    try {
      await deleteAnnonce(session.token, id);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Suppression impossible.");
    } finally {
      setActionId(null);
    }
  }

  if (!session || !isProducteur) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="font-[family-name:var(--font-work-sans)] text-base text-[#4a3f33]">
          Redirection...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-3xl font-bold text-[#241a12]">Mes annonces</h1>
          <p className="font-[family-name:var(--font-work-sans)] text-base text-[#4a3f33]">
            Gerez vos plants publies sur le catalogue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="whitespace-nowrap rounded-lg bg-[#b8552b] px-6 py-2.5 font-[family-name:var(--font-work-sans)] text-sm font-semibold text-white hover:bg-[#8f3f1c]"
        >
          {showForm ? "Annuler" : "Nouvelle annonce"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4 rounded-xl border border-[#e4d3ae] bg-white p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Espece</span>
              <input
                type="text"
                required
                value={espece}
                onChange={(e) => setEspece(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Variete (optionnel)</span>
              <input
                type="text"
                value={variete}
                onChange={(e) => setVariete(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Categorie</span>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as Categorie)}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Quantite</span>
              <input
                type="number"
                min={1}
                required
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Prix unitaire (FCFA)</span>
              <input
                type="number"
                min={0}
                required
                value={prixUnitaire}
                onChange={(e) => setPrixUnitaire(Number(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Ville (optionnel)</span>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Region (optionnel)</span>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Photos (URL, optionnel, 5 max)</span>
            {photos.map((photo, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="url"
                  value={photo}
                  onChange={(e) => handlePhotoChange(photos, setPhotos, i, e.target.value)}
                  placeholder="https://..."
                  className={`flex-1 ${inputClass}`}
                />
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePhotoField(photos, setPhotos, i)}
                    className="rounded-lg border border-[#d9c7a3] px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14] hover:bg-black/5"
                  >
                    Retirer
                  </button>
                )}
              </div>
            ))}
            {photos.length < 5 && (
              <button
                type="button"
                onClick={() => handleAddPhotoField(photos, setPhotos)}
                className="w-fit font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#8f3f1c] hover:underline"
              >
                + Ajouter une photo (URL)
              </button>
            )}
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#d9c7a3] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#4a3f33] hover:bg-black/5">
              {uploadingCreate ? "Envoi..." : "Importer une photo depuis mon appareil"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingCreate || photos.filter((p) => p.trim()).length >= 5}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, photos, setPhotos, setUploadingCreate, setFormError);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
          </div>

          {formError && (
            <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="mt-2 rounded-lg bg-[#b8552b] px-6 py-3 font-[family-name:var(--font-work-sans)] text-base font-semibold text-white hover:bg-[#8f3f1c] disabled:opacity-60"
          >
            {creating ? "Publication..." : "Publier l'annonce"}
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-lg bg-[#fdecea] px-4 py-3 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[#ebdfc3]" />
          ))}
        </div>
      ) : annonces.length === 0 ? (
        <p className="py-16 text-center font-[family-name:var(--font-work-sans)] text-base text-[#8a7960]">
          Vous n&apos;avez pas encore publie d&apos;annonce.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {annonces.map((annonce) => (
            <div
              key={annonce.id}
              className={`flex flex-col gap-3 overflow-hidden rounded-xl border-l-4 border-[#e4d3ae] bg-white p-4 ${categorieColors[annonce.categorie].ring.replace("border-", "border-l-")}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {annonce.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- photo host is user-provided, unknown at build time
                    <img
                      src={annonce.photos[0]}
                      alt={annonce.espece}
                      className="size-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[#ebdfc3] text-xs text-[#8a7960]">
                      Pas de photo
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <p className="font-sans text-base font-semibold text-[#241a12]">
                        {annonce.espece}
                        {annonce.variete ? ` · ${annonce.variete}` : ""}
                      </p>
                      <span
                        className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-xs ${categorieColors[annonce.categorie].bg} ${categorieColors[annonce.categorie].text} ${categorieColors[annonce.categorie].ring}`}
                      >
                        {categorieLabels[annonce.categorie]}
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#8a7960]">
                      {annonce.quantite} en stock · {annonce.prixUnitaire.toLocaleString("fr-FR")} FCFA/unite
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-xs font-medium ${statutColors[annonce.statut]}`}
                  >
                    {statutLabels[annonce.statut]}
                  </span>

                  <select
                    value={annonce.statut}
                    disabled={actionId === annonce.id}
                    onChange={(e) => handleStatutChange(annonce.id, e.target.value as StatutAnnonce)}
                    className="rounded-lg border border-[#d9c7a3] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm text-[#241a12] outline-none focus:border-[#b8552b] disabled:opacity-60"
                  >
                    {(Object.keys(statutLabels) as StatutAnnonce[]).map((s) => (
                      <option key={s} value={s}>
                        {statutLabels[s]}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      editingPhotosId === annonce.id
                        ? setEditingPhotosId(null)
                        : handleStartEditPhotos(annonce)
                    }
                    className="rounded-lg border border-[#d9c7a3] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#4a3f33] hover:bg-black/5"
                  >
                    Photos
                  </button>

                  <button
                    type="button"
                    disabled={actionId === annonce.id}
                    onClick={() => handleDelete(annonce.id)}
                    className="rounded-lg border border-[#d9c7a3] px-3 py-1.5 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#7a1f14] hover:bg-black/5 disabled:opacity-60"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {editingPhotosId === annonce.id && (
                <div className="flex flex-col gap-2 rounded-lg border border-[#d9c7a3] p-3">
                  {editPhotos.map((photo, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={photo}
                        onChange={(e) =>
                          handlePhotoChange(editPhotos, setEditPhotos, i, e.target.value)
                        }
                        placeholder="https://..."
                        className={`flex-1 ${inputClass}`}
                      />
                      {editPhotos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoField(editPhotos, setEditPhotos, i)}
                          className="rounded-lg border border-[#d9c7a3] px-3 py-2.5 font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14] hover:bg-black/5"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  ))}
                  {editPhotos.length < 5 && (
                    <button
                      type="button"
                      onClick={() => handleAddPhotoField(editPhotos, setEditPhotos)}
                      className="w-fit font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#8f3f1c] hover:underline"
                    >
                      + Ajouter une photo (URL)
                    </button>
                  )}
                  <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#d9c7a3] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#4a3f33] hover:bg-black/5">
                    {uploadingEdit ? "Envoi..." : "Importer une photo depuis mon appareil"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploadingEdit || editPhotos.filter((p) => p.trim()).length >= 5}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, editPhotos, setEditPhotos, setUploadingEdit, setPhotosError);
                        }
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>

                  {photosError && (
                    <p className="font-[family-name:var(--font-work-sans)] text-sm text-[#7a1f14]">
                      {photosError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={savingPhotos}
                      onClick={() => handleSavePhotos(annonce.id)}
                      className="rounded-lg bg-[#b8552b] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm font-medium text-white hover:bg-[#8f3f1c] disabled:opacity-60"
                    >
                      {savingPhotos ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPhotosId(null)}
                      className="rounded-lg border border-[#d9c7a3] px-4 py-2 font-[family-name:var(--font-work-sans)] text-sm text-[#4a3f33] hover:bg-black/5"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
