import ComingSoon from "@/components/ComingSoon";

function Reports() {
  return (
    <ComingSoon
      title="Relatórios"
      description="Visões consolidadas por time e organização."
      plannedItems={[
        "Comparativo de competências por time",
        "Evolução dos resultados entre ciclos",
        "Exportação dos dados agregados",
      ]}
    />
  );
}

export default Reports;
