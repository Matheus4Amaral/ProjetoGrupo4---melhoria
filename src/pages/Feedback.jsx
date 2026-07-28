import ComingSoon from "@/components/ComingSoon";

function Feedback() {
  return (
    <ComingSoon
      title="Feedbacks"
      description="Panorama agregado e anônimo dos feedbacks recebidos pelos times."
      plannedItems={[
        "Médias por competência agregadas por time",
        "Comparativo entre autoavaliação e média externa",
        "Destaques e pontos de atenção do ciclo",
      ]}
    />
  );
}

export default Feedback;
