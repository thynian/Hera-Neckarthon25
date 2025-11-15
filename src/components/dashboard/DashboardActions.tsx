import { useState } from "react";
import { Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordingDialog } from "@/components/audio/RecordingDialog";
import { NewDocumentationDialog } from "@/components/documentation/NewDocumentationDialog";
import { AudioFile, Client, Case, Documentation } from "@/types";

interface DashboardActionsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  audioFiles: AudioFile[];
  setAudioFiles: React.Dispatch<React.SetStateAction<AudioFile[]>>;
  onSaveDocumentation: (documentation: Documentation) => void;
}

export const DashboardActions = ({
  clients,
  setClients,
  cases,
  setCases,
  audioFiles,
  setAudioFiles,
  onSaveDocumentation,
}: DashboardActionsProps) => {
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [showDocumentationDialog, setShowDocumentationDialog] = useState(false);

  const handleStartRecording = () => {
    setShowRecordingDialog(true);
  };

  const handleSaveAudio = (audioFile: AudioFile) => {
    setAudioFiles((prev) => [...prev, audioFile]);
    console.log("Neue Audio-Datei gespeichert:", audioFile);
  };

  const handleNewDocumentation = () => {
    setShowDocumentationDialog(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              size="lg"
              onClick={handleStartRecording}
              className="h-24 text-lg"
            >
              <Mic className="mr-3 h-6 w-6" />
              Neue Audioaufnahme starten
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleNewDocumentation}
              className="h-24 text-lg"
            >
              <FileText className="mr-3 h-6 w-6" />
              Neue Dokumentation anlegen
            </Button>
          </div>
        </CardContent>
      </Card>

      <RecordingDialog
        open={showRecordingDialog}
        onOpenChange={setShowRecordingDialog}
        onSave={handleSaveAudio}
      />

      <NewDocumentationDialog
        open={showDocumentationDialog}
        onOpenChange={setShowDocumentationDialog}
        clients={clients}
        setClients={setClients}
        cases={cases}
        setCases={setCases}
        audioFiles={audioFiles}
        onSave={onSaveDocumentation}
      />
    </>
  );
};
