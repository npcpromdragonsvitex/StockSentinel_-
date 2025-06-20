import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export function RiskAnalysis() {
  const riskFactors = [
    {
      level: 'HIGH' as const,
      title: 'Высокий риск',
      description: 'Концентрация в банковском секторе',
      icon: AlertTriangle,
      color: 'bg-red-600',
      textColor: 'text-red-500'
    },
    {
      level: 'MEDIUM' as const,
      title: 'Средний риск',
      description: 'Валютные колебания',
      icon: AlertTriangle,
      color: 'bg-amber-600',
      textColor: 'text-amber-500'
    },
    {
      level: 'LOW' as const,
      title: 'Низкий риск',
      description: 'Ликвидность активов',
      icon: CheckCircle,
      color: 'bg-green-600',
      textColor: 'text-green-500'
    }
  ];

  const getRiskSymbol = (level: string) => {
    switch (level) {
      case 'HIGH':
        return '!!';
      case 'MEDIUM':
        return '!';
      case 'LOW':
        return '✓';
      default:
        return '?';
    }
  };

  return (
    <div className="bg-slate-850 rounded-xl p-6 border border-slate-800 mb-8">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <Shield className="text-red-500 mr-3 h-5 w-5" />
        Анализ рисков портфеля
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {riskFactors.map((risk, index) => (
          <div key={index} className="text-center">
            <div className={`w-16 h-16 ${risk.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className="text-white text-xl font-bold">
                {getRiskSymbol(risk.level)}
              </span>
            </div>
            <h4 className="font-medium text-white mb-2">{risk.title}</h4>
            <p className="text-sm text-slate-400">{risk.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
