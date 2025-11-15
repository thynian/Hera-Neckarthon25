import { Client, Case, Documentation, AudioFile } from "@/types";
import { DashboardActions } from "./DashboardActions";
import { OpenDocumentations } from "./OpenDocumentations";
import { AudioFilesList } from "./AudioFilesList";
import { toast } from "sonner";

interface DashboardProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  documentations: Documentation[];
  setDocumentations: React.Dispatch<React.SetStateAction<Documentation[]>>;
  audioFiles: AudioFile[];
  setAudioFiles: React.Dispatch<React.SetStateAction<AudioFile[]>>;
}

export const Dashboard = ({
  clients,
  setClients,
  cases,
  setCases,
  documentations,
  setDocumentations,
  audioFiles,
  setAudioFiles,
}: DashboardProps) => {
  const handleSaveDocumentation = (documentation: Documentation) => {
    setDocumentations((prev) => [...prev, documentation]);
    console.log("Neue Dokumentation gespeichert:", documentation);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Arbeits-Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Übersicht über offene Dokumentationen und Audiodateien
        </p>
      </div>

      <DashboardActions
        clients={clients}
        setClients={setClients}
        cases={cases}
        setCases={setCases}
        audioFiles={audioFiles}
        setAudioFiles={setAudioFiles}
        onSaveDocumentation={handleSaveDocumentation}
      />
      
      <OpenDocumentations documentations={documentations} cases={cases} />
      
      <AudioFilesList documentations={documentations} audioFiles={audioFiles} />
    </div>
  );
};
