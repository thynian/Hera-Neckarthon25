type TabType = "offen" | "mein-bereich" | "team-bereich";

interface ContentAreaProps {
  activeTab: TabType;
}

const contentMap: Record<TabType, { title: string; description: string }> = {
  offen: {
    title: "Bereich: Offen",
    description: "Dashboard",
  },
  "mein-bereich": {
    title: "Bereich: Mein Bereich",
    description: "Persönlicher Fokusbereich – später",
  },
  "team-bereich": {
    title: "Bereich: Team Bereich",
    description: "Übersicht für alle Fälle",
  },
};

export const ContentArea = ({ activeTab }: ContentAreaProps) => {
  const content = contentMap[activeTab];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-content-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {content.title}
          </h1>
          <p className="text-lg text-muted-foreground">{content.description}</p>
        </div>
      </div>
    </div>
  );
};
