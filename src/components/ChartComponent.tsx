'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { ChartData } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartComponentProps {
  chartData: ChartData;
  title: string;
  height?: number;
}

export function ChartComponent({ chartData, title, height = 300 }: ChartComponentProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: chartData.type === 'pie' || chartData.type === 'doughnut' ? undefined : {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderChart = () => {
    switch (chartData.type) {
      case 'line':
        return <Line data={chartData.data} options={options} />;
      case 'bar':
        return <Bar data={chartData.data} options={options} />;
      case 'pie':
        return <Pie data={chartData.data} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData.data} options={options} />;
      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      {renderChart()}
    </div>
  );
}