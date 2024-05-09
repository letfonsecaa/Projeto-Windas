const temperatura = document.getElementById("graficoTemperatura");
const umidade = document.getElementById("graficoUmidade");

new Chart(temperatura, {
  type: "line",
  data: {
    labels: ["5", "6", "7", "8", "9", "10"],
    datasets: [
      {
        label: "Temperatura",
        data: [30, 29, 28, 25, 22, 23],
        borderWidth: 3,
        borderColor: "#ff6384",
        backgroundColor: "#ff6384",
      },
    ],
  },
  options: {
    scales: {
      y: {
        
      },
    },
  },
});

new Chart(umidade, {
  type: "line",
  data: {
    labels: ["5", "6", "7", "8", "9", "10"],
    datasets: [
      {
        label: "Umidade",
        data: [40, 42, 43, 40, 42, 45],
        borderWidth: 3,
        borderColor: "#36a2eb",
        backgroundColor: "#36a2eb",
      },
    ],
  },
  options: {
    scales: {
      y: {
        
      },
    },
  },
});
