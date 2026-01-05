'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Treemap, FunnelChart, Funnel, LabelList } from 'recharts';
import { Calculator, TrendingUp, Wallet, Building2, Heart, Shield, ChevronDown, ChevronUp, Info, Sparkles, ArrowRight, Minus, Plus, DollarSign, PiggyBank, Home, Briefcase, Car, Users, GraduationCap, Utensils, Gift, ArrowLeftRight, Building, Percent, Target, Zap, BarChart3, PieChartIcon, Activity, Gauge, TrendingDown, RefreshCw, CircleDollarSign, BadgePercent, Landmark, HandCoins } from 'lucide-react';

// 2026 Kenya Tax Constants
const TAX_BANDS = [
  { min: 0, max: 24000, rate: 0.10, label: '10%', color: '#10B981' },
  { min: 24000, max: 32333, rate: 0.25, label: '25%', color: '#3B82F6' },
  { min: 32333, max: 500000, rate: 0.30, label: '30%', color: '#F59E0B' },
  { min: 500000, max: 800000, rate: 0.325, label: '32.5%', color: '#F97316' },
  { min: 800000, max: Infinity, rate: 0.35, label: '35%', color: '#EF4444' }
];

const PERSONAL_RELIEF = 2400;
const DISABILITY_RELIEF = 150000;
const NSSF_RATE = 0.06;
const NSSF_UPPER_LIMIT = 72000;
const SHIF_RATE = 0.0275;
const SHIF_MIN = 300;
const HOUSING_LEVY_RATE = 0.015;
const MAX_PENSION_DEDUCTION = 30000;
const MAX_MORTGAGE_DEDUCTION = 25000;
const MAX_INSURANCE_RELIEF = 5000;

// Car benefit rates based on CC
const CAR_BENEFIT_RATES = {
  'none': 0,
  'below1500': 3600,
  '1500to2000': 4800,
  '2000to3000': 7200,
  'above3000': 12000
};

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatCompact = (amount) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toString();
};

const calculateNSSF = (grossSalary) => {
  const pensionableEarnings = Math.min(grossSalary, NSSF_UPPER_LIMIT);
  return pensionableEarnings * NSSF_RATE;
};

const calculateSHIF = (grossSalary) => {
  const shif = grossSalary * SHIF_RATE;
  return Math.max(shif, SHIF_MIN);
};

const calculateHousingLevy = (grossSalary) => {
  return grossSalary * HOUSING_LEVY_RATE;
};

const calculatePAYE = (taxableIncome, hasDisability = false) => {
  let tax = 0;
  let remainingIncome = taxableIncome;
  
  for (const band of TAX_BANDS) {
    if (remainingIncome <= 0) break;
    const taxableInBand = Math.min(remainingIncome, band.max - band.min);
    tax += taxableInBand * band.rate;
    remainingIncome -= taxableInBand;
  }
  
  // Apply personal relief
  let relief = PERSONAL_RELIEF;
  if (hasDisability) relief += DISABILITY_RELIEF;
  tax = Math.max(0, tax - relief);
  
  return tax;
};

const getTaxBandBreakdown = (taxableIncome) => {
  const breakdown = [];
  let remainingIncome = taxableIncome;
  
  for (const band of TAX_BANDS) {
    if (remainingIncome <= 0) {
      breakdown.push({ ...band, amount: 0, tax: 0 });
      continue;
    }
    const taxableInBand = Math.min(remainingIncome, band.max - band.min);
    const tax = taxableInBand * band.rate;
    breakdown.push({ ...band, amount: taxableInBand, tax });
    remainingIncome -= taxableInBand;
  }
  
  return breakdown;
};

// Reverse calculation - Net to Gross
const calculateGrossFromNet = (targetNet, deductions) => {
  let low = targetNet;
  let high = targetNet * 3;
  
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const calc = fullCalculation(mid, deductions);
    
    if (Math.abs(calc.netSalary - targetNet) < 1) {
      return mid;
    }
    
    if (calc.netSalary > targetNet) {
      high = mid;
    } else {
      low = mid;
    }
  }
  
  return (low + high) / 2;
};

// Full calculation function
const fullCalculation = (grossSalary, options = {}) => {
  const {
    pensionContribution = 0,
    mortgageInterest = 0,
    insurancePremium = 0,
    hasDisability = false,
    helbRepayment = 0,
    saccoContribution = 0,
    unionDues = 0,
    carBenefit = 'none',
    housingBenefit = 0,
    otherTaxableBenefits = 0
  } = options;

  // Calculate benefits in kind
  const carBenefitAmount = CAR_BENEFIT_RATES[carBenefit] || 0;
  const housingBenefitTaxable = Math.min(housingBenefit, grossSalary * 0.15);
  const totalBenefits = carBenefitAmount + housingBenefitTaxable + otherTaxableBenefits;
  
  // Adjusted gross for tax purposes
  const adjustedGross = grossSalary + totalBenefits;
  
  const nssf = calculateNSSF(grossSalary);
  const shif = calculateSHIF(grossSalary);
  const housingLevy = calculateHousingLevy(grossSalary);
  
  // Calculate allowable deductions
  const maxPension = Math.min(pensionContribution, MAX_PENSION_DEDUCTION);
  const maxMortgage = Math.min(mortgageInterest, MAX_MORTGAGE_DEDUCTION);
  const insuranceRelief = Math.min(insurancePremium * 0.15, MAX_INSURANCE_RELIEF);
  
  // Taxable income
  const taxableIncome = adjustedGross - nssf - maxPension - maxMortgage;
  const paye = calculatePAYE(Math.max(0, taxableIncome), hasDisability);
  const finalPAYE = Math.max(0, paye - insuranceRelief);
  
  // Statutory deductions
  const statutoryDeductions = finalPAYE + nssf + shif + housingLevy;
  
  // Voluntary deductions (after tax)
  const voluntaryDeductions = helbRepayment + saccoContribution + unionDues;
  
  const totalDeductions = statutoryDeductions + voluntaryDeductions;
  const netSalary = grossSalary - totalDeductions;
  
  const effectiveTaxRate = (finalPAYE / grossSalary) * 100;
  const totalDeductionRate = (totalDeductions / grossSalary) * 100;
  
  // Employer costs
  const employerNSSF = nssf; // Employer matches NSSF
  const employerHousingLevy = housingLevy; // Employer matches housing levy
  const totalEmployerCost = grossSalary + employerNSSF + employerHousingLevy;
  
  return {
    grossSalary,
    adjustedGross,
    nssf,
    shif,
    housingLevy,
    taxableIncome: Math.max(0, taxableIncome),
    paye: finalPAYE,
    statutoryDeductions,
    voluntaryDeductions,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    totalDeductionRate,
    taxBandBreakdown: getTaxBandBreakdown(Math.max(0, taxableIncome)),
    insuranceRelief,
    helbRepayment,
    saccoContribution,
    unionDues,
    carBenefitAmount,
    housingBenefitTaxable,
    totalBenefits,
    employerNSSF,
    employerHousingLevy,
    totalEmployerCost,
    maxPension,
    maxMortgage
  };
};

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-lg shadow-red-500/25' 
        : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// Animated Counter Component
const AnimatedValue = ({ value, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 500;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{prefix}{formatCurrency(Math.round(displayValue))}{suffix}</span>;
};

// Gauge Component
const GaugeChart = ({ value, max = 50, label, color = '#EF4444' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const rotation = (percentage / 100) * 180;
  
  return (
    <div className="relative w-40 h-24 mx-auto">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#374151"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 2.51} 251`}
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
        {/* Center text */}
        <text x="100" y="85" textAnchor="middle" className="fill-white text-2xl font-bold">
          {value.toFixed(1)}%
        </text>
        <text x="100" y="100" textAnchor="middle" className="fill-stone-400 text-xs">
          {label}
        </text>
      </svg>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ label, value, max, color, icon: Icon }) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-sm text-stone-300">{label}</span>
        </div>
        <span className="text-sm font-medium text-white">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Waterfall Chart Component
const WaterfallChart = ({ data }) => {
  let cumulative = 0;
  const waterfallData = data.map((item, index) => {
    const start = cumulative;
    cumulative += item.value;
    return {
      ...item,
      start,
      end: cumulative,
      isPositive: item.value >= 0
    };
  });

  return (
    <div className="space-y-2">
      {waterfallData.map((item, index) => (
        <div key={index} className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-stone-400">{item.name}</span>
            <span className={`text-sm font-medium ${item.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.isPositive ? '+' : ''}{formatCurrency(item.value)}
            </span>
          </div>
          <div className="h-8 bg-stone-800/50 rounded-lg relative overflow-hidden">
            <div 
              className={`absolute h-full rounded-lg transition-all duration-700 ${
                item.isPositive ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-red-600 to-red-500'
              }`}
              style={{ 
                left: `${(item.start / waterfallData[0].value) * 100}%`,
                width: `${(Math.abs(item.value) / waterfallData[0].value) * 100}%`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-end pr-3">
              <span className="text-xs font-bold text-white/80">{formatCurrency(item.end)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Component
export default function PAYECalculatorV2() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [grossSalary, setGrossSalary] = useState(100000);
  const [targetNetSalary, setTargetNetSalary] = useState(75000);
  const [bonusAmount, setBonusAmount] = useState(50000);
  
  // Deductions & Reliefs
  const [pensionContribution, setPensionContribution] = useState(0);
  const [mortgageInterest, setMortgageInterest] = useState(0);
  const [insurancePremium, setInsurancePremium] = useState(0);
  const [hasDisability, setHasDisability] = useState(false);
  
  // Voluntary Deductions
  const [helbRepayment, setHelbRepayment] = useState(0);
  const [saccoContribution, setSaccoContribution] = useState(0);
  const [unionDues, setUnionDues] = useState(0);
  
  // Benefits in Kind
  const [carBenefit, setCarBenefit] = useState('none');
  const [housingBenefit, setHousingBenefit] = useState(0);
  const [otherBenefits, setOtherBenefits] = useState(0);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  const deductionOptions = {
    pensionContribution,
    mortgageInterest,
    insurancePremium,
    hasDisability,
    helbRepayment,
    saccoContribution,
    unionDues,
    carBenefit,
    housingBenefit,
    otherTaxableBenefits: otherBenefits
  };

  const calculations = useMemo(() => fullCalculation(grossSalary, deductionOptions), 
    [grossSalary, pensionContribution, mortgageInterest, insurancePremium, hasDisability, 
     helbRepayment, saccoContribution, unionDues, carBenefit, housingBenefit, otherBenefits]);

  // Net to Gross calculation
  const grossFromNet = useMemo(() => calculateGrossFromNet(targetNetSalary, deductionOptions), [targetNetSalary, deductionOptions]);
  const reverseCalc = useMemo(() => fullCalculation(grossFromNet, deductionOptions), [grossFromNet, deductionOptions]);

  // Bonus calculation (taxed at marginal rate)
  const bonusCalc = useMemo(() => {
    const withBonus = fullCalculation(grossSalary + bonusAmount, deductionOptions);
    const bonusTax = withBonus.paye - calculations.paye;
    const netBonus = bonusAmount - bonusTax;
    const bonusTaxRate = (bonusTax / bonusAmount) * 100;
    return { bonusTax, netBonus, bonusTaxRate };
  }, [grossSalary, bonusAmount, calculations.paye, deductionOptions]);

  // Chart Data
  const pieData = [
    { name: 'Net Salary', value: calculations.netSalary, color: '#10B981' },
    { name: 'PAYE Tax', value: calculations.paye, color: '#EF4444' },
    { name: 'NSSF', value: calculations.nssf, color: '#3B82F6' },
    { name: 'SHIF', value: calculations.shif, color: '#8B5CF6' },
    { name: 'Housing Levy', value: calculations.housingLevy, color: '#F59E0B' },
    ...(calculations.helbRepayment > 0 ? [{ name: 'HELB', value: calculations.helbRepayment, color: '#EC4899' }] : []),
    ...(calculations.saccoContribution > 0 ? [{ name: 'SACCO', value: calculations.saccoContribution, color: '#06B6D4' }] : []),
  ].filter(d => d.value > 0);

  const waterfallData = [
    { name: 'Gross Salary', value: calculations.grossSalary },
    { name: 'PAYE Tax', value: -calculations.paye },
    { name: 'NSSF', value: -calculations.nssf },
    { name: 'SHIF', value: -calculations.shif },
    { name: 'Housing Levy', value: -calculations.housingLevy },
    ...(calculations.helbRepayment > 0 ? [{ name: 'HELB', value: -calculations.helbRepayment }] : []),
    ...(calculations.saccoContribution > 0 ? [{ name: 'SACCO', value: -calculations.saccoContribution }] : []),
    ...(calculations.unionDues > 0 ? [{ name: 'Union Dues', value: -calculations.unionDues }] : []),
  ];

  const salaryProgression = [30000, 50000, 75000, 100000, 150000, 200000, 300000, 500000, 800000, 1000000].map(salary => {
    const calc = fullCalculation(salary, {});
    return {
      salary: formatCompact(salary),
      gross: salary,
      net: calc.netSalary,
      paye: calc.paye,
      effectiveRate: calc.effectiveTaxRate
    };
  });

  const taxEfficiencyData = [
    { subject: 'Take Home', A: 100 - calculations.totalDeductionRate, fullMark: 100 },
    { subject: 'Tax Efficiency', A: 100 - calculations.effectiveTaxRate, fullMark: 100 },
    { subject: 'NSSF Max', A: calculations.nssf >= calculateNSSF(NSSF_UPPER_LIMIT) ? 100 : (calculations.nssf / calculateNSSF(NSSF_UPPER_LIMIT)) * 100, fullMark: 100 },
    { subject: 'Relief Used', A: ((calculations.insuranceRelief + calculations.maxPension + calculations.maxMortgage) / (MAX_INSURANCE_RELIEF + MAX_PENSION_DEDUCTION + MAX_MORTGAGE_DEDUCTION)) * 100, fullMark: 100 },
  ];

  const employerCostData = [
    { name: 'Gross Salary', value: calculations.grossSalary, color: '#3B82F6' },
    { name: 'Employer NSSF', value: calculations.employerNSSF, color: '#10B981' },
    { name: 'Employer Housing', value: calculations.employerHousingLevy, color: '#F59E0B' },
  ];

  const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    net: calculations.netSalary,
    gross: calculations.grossSalary,
    cumNet: calculations.netSalary * (i + 1),
    cumGross: calculations.grossSalary * (i + 1),
    cumTax: calculations.paye * (i + 1)
  }));

  const deductionBreakdown = [
    { name: 'PAYE', value: calculations.paye, fill: '#EF4444' },
    { name: 'NSSF', value: calculations.nssf, fill: '#3B82F6' },
    { name: 'SHIF', value: calculations.shif, fill: '#8B5CF6' },
    { name: 'Housing', value: calculations.housingLevy, fill: '#F59E0B' },
    { name: 'HELB', value: calculations.helbRepayment, fill: '#EC4899' },
    { name: 'SACCO', value: calculations.saccoContribution, fill: '#06B6D4' },
    { name: 'Union', value: calculations.unionDues, fill: '#84CC16' },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-stone-300">2026 Tax Rules • All Deductions</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
              <span className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 bg-clip-text text-transparent">
                Kenya PAYE
              </span>{' '}
              <span className="text-white">Pro</span>
            </h1>
            <p className="text-stone-400 text-base md:text-lg">
              Complete payroll calculator with HELB, SACCO, Benefits & more
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <TabButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} icon={Calculator} label="Calculator" />
            <TabButton active={activeTab === 'reverse'} onClick={() => setActiveTab('reverse')} icon={RefreshCw} label="Net → Gross" />
            <TabButton active={activeTab === 'bonus'} onClick={() => setActiveTab('bonus')} icon={Gift} label="Bonus" />
            <TabButton active={activeTab === 'employer'} onClick={() => setActiveTab('employer')} icon={Building} label="Employer Cost" />
            <TabButton active={activeTab === 'compare'} onClick={() => setActiveTab('compare')} icon={BarChart3} label="Compare" />
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 md:px-6 pb-20">
        <div className="max-w-7xl mx-auto">

          {/* Main Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className={`space-y-6 transition-all duration-500 ${animated ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Salary Input */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-amber-500 rounded-2xl">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Monthly Gross Salary</h2>
                    <p className="text-stone-400 text-sm">Slide or enter your salary</p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-5xl md:text-7xl font-black text-white mb-1 tabular-nums">
                    {formatCurrency(grossSalary)}
                  </div>
                </div>

                <input
                  type="range"
                  min="15000"
                  max="2000000"
                  step="5000"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Number(e.target.value))}
                  className="w-full h-3 bg-stone-800 rounded-full appearance-none cursor-pointer mb-4"
                  style={{
                    background: `linear-gradient(to right, #DC2626 0%, #F59E0B ${(grossSalary - 15000) / (2000000 - 15000) * 100}%, #374151 ${(grossSalary - 15000) / (2000000 - 15000) * 100}%, #374151 100%)`
                  }}
                />

                <div className="flex flex-wrap gap-2 justify-center">
                  {[50000, 100000, 150000, 250000, 500000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setGrossSalary(amount)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        grossSalary === amount 
                          ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white' 
                          : 'bg-white/5 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      {formatCompact(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Results */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-2 bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-stone-400 text-sm">Net Salary</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-emerald-400">
                    <AnimatedValue value={calculations.netSalary} />
                  </div>
                  <p className="text-stone-500 text-xs mt-1">{(100 - calculations.totalDeductionRate).toFixed(1)}% of gross</p>
                </div>

                <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 backdrop-blur-xl rounded-2xl border border-red-500/20 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-red-400" />
                    <span className="text-stone-400 text-sm">PAYE</span>
                  </div>
                  <div className="text-xl font-bold text-red-400">{formatCurrency(calculations.paye)}</div>
                  <p className="text-stone-500 text-xs mt-1">{calculations.effectiveTaxRate.toFixed(1)}% rate</p>
                </div>

                <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/20 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Minus className="w-4 h-4 text-amber-400" />
                    <span className="text-stone-400 text-sm">Deductions</span>
                  </div>
                  <div className="text-xl font-bold text-amber-400">{formatCurrency(calculations.totalDeductions)}</div>
                  <p className="text-stone-500 text-xs mt-1">{calculations.totalDeductionRate.toFixed(1)}% total</p>
                </div>
              </div>

              {/* Statutory Deductions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'NSSF Pension', value: calculations.nssf, icon: Shield, color: '#3B82F6', desc: '6% to 72K' },
                  { label: 'SHIF Health', value: calculations.shif, icon: Heart, color: '#8B5CF6', desc: '2.75%' },
                  { label: 'Housing Levy', value: calculations.housingLevy, icon: Home, color: '#F59E0B', desc: '1.5%' },
                  { label: 'Taxable Income', value: calculations.taxableIncome, icon: Briefcase, color: '#10B981', desc: 'After NSSF' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      <span className="text-stone-400 text-xs">{item.label}</span>
                    </div>
                    <div className="text-lg font-bold text-white">{formatCurrency(item.value)}</div>
                    <p className="text-stone-600 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Voluntary Deductions */}
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 flex items-center justify-between hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-pink-400" />
                  <span className="font-medium">HELB, SACCO & Voluntary Deductions</span>
                </div>
                {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showAdvanced && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5 grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-stone-400 mb-2">HELB Repayment</label>
                    <input
                      type="number"
                      value={helbRepayment}
                      onChange={(e) => setHelbRepayment(Number(e.target.value))}
                      className="w-full bg-stone-800/50 border border-stone-700 rounded-lg py-2.5 px-3 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-400 mb-2">SACCO Contribution</label>
                    <input
                      type="number"
                      value={saccoContribution}
                      onChange={(e) => setSaccoContribution(Number(e.target.value))}
                      className="w-full bg-stone-800/50 border border-stone-700 rounded-lg py-2.5 px-3 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-400 mb-2">Union Dues</label>
                    <input
                      type="number"
                      value={unionDues}
                      onChange={(e) => setUnionDues(Number(e.target.value))}
                      className="w-full bg-stone-800/50 border border-stone-700 rounded-lg py-2.5 px-3 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Tax Reliefs */}
              <button 
                onClick={() => setShowBenefits(!showBenefits)}
                className="w-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 flex items-center justify-between hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">Tax Reliefs & Benefits in Kind</span>
                </div>
                {showBenefits ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showBenefits && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-stone-400 mb-2">Extra Pension (max 30K)</label>
                      <input
                        type="number"
                        value={pensionContribution}
                        onChange={(e) => setPensionContribution(Number(e.target.value))}
                        className="w-full bg-stone-800/50 border border-stone-700 rounded-lg py-2.5 px-3 text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone-400 mb-2">Mortgage Interest (max 25K)</label>
                      <input
                        type="number"
                        value={mortgageInterest}
                        onChange={(e) => setMortgageInterest(Number(e.target.value))}
                        className="w-full bg-stone-800/50 border border-stone-700 rounded-lg py-2.5 px-3 text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone-400 mb-2">Insurance Premium</label>
                      <input
                        type="number"
                        value={insurancePremium}
                        onChange={(e) => setInsurancePremium(Number(e.target.value))}
                        className="w-full bg-stone-800/50 border border-stone-700 rounded-lg py-2.5 px-3 text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-medium text-stone-300 mb-3">Benefits in Kind (Taxable)</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-stone-400 mb-2">Company Car</label>
                        <select
                          value={carBenefit}
                          onChange={(e) => setCarBenefit(e.target.value)}
                          className="w-full bg-stone-800/50 border border-stone-700 rounded-lg py-2.5 px-3 text-white"
                        >
                          <option value="none">No car benefit</option>
                          <option value="below1500">Below 1500cc (KES 3,600)</option>
                          <option value="1500to2000">1500-2000cc (KES 4,800)</option>
                          <option value="2000to3000">2000-3000cc (KES 7,200)</option>
                          <option value="above3000">Above 3000cc (KES 12,000)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-stone-400 mb-2">Housing Benefit</label>
                        <input
                          type="number"
                          value={housingBenefit}
                          onChange={(e) => setHousingBenefit(Number(e.target.value))}
                          className="w-full bg-stone-800/50 border border-stone-700 rounded-lg py-2.5 px-3 text-white"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-stone-400 mb-2">Other Benefits</label>
                        <input
                          type="number"
                          value={otherBenefits}
                          onChange={(e) => setOtherBenefits(Number(e.target.value))}
                          className="w-full bg-stone-800/50 border border-stone-700 rounded-lg py-2.5 px-3 text-white"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="disability"
                      checked={hasDisability}
                      onChange={(e) => setHasDisability(e.target.checked)}
                      className="w-4 h-4 rounded bg-stone-800 border-stone-700"
                    />
                    <label htmlFor="disability" className="text-sm text-stone-300">
                      Registered Person with Disability (NCPWD) - KES 150,000 relief
                    </label>
                  </div>
                </div>
              )}

              {/* Charts Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-amber-400" />
                    Salary Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                        <Legend formatter={(v) => <span className="text-stone-300 text-xs">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Waterfall Chart */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Gross → Net Breakdown
                  </h3>
                  <WaterfallChart data={waterfallData} />
                </div>
              </div>

              {/* More Charts Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Gauges */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-red-400" />
                    Tax Rates
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <GaugeChart value={calculations.effectiveTaxRate} max={40} label="Effective Tax" color="#EF4444" />
                    <GaugeChart value={calculations.totalDeductionRate} max={50} label="Total Deductions" color="#F59E0B" />
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Tax Efficiency
                  </h3>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={taxEfficiencyData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <Radar name="Score" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Deduction Breakdown Bar */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Deduction Split
                  </h3>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deductionBreakdown} layout="vertical">
                        <XAxis type="number" tickFormatter={(v) => formatCompact(v)} stroke="#6B7280" />
                        <YAxis type="category" dataKey="name" width={60} stroke="#6B7280" tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {deductionBreakdown.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Annual Projection */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Annual Projection
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend}>
                      <defs>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis tickFormatter={(v) => formatCompact(v)} stroke="#6B7280" />
                      <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="cumNet" name="Cumulative Net" stroke="#10B981" fill="url(#colorNet)" />
                      <Area type="monotone" dataKey="cumTax" name="Cumulative Tax" stroke="#EF4444" fill="url(#colorTax)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-stone-400 text-xs">Annual Gross</p>
                    <p className="text-lg font-bold">{formatCurrency(calculations.grossSalary * 12)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-400 text-xs">Annual Net</p>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(calculations.netSalary * 12)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-400 text-xs">Annual Tax</p>
                    <p className="text-lg font-bold text-red-400">{formatCurrency(calculations.paye * 12)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-400 text-xs">Annual NSSF</p>
                    <p className="text-lg font-bold text-blue-400">{formatCurrency(calculations.nssf * 12)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Net to Gross Tab */}
          {activeTab === 'reverse' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                    <RefreshCw className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Net → Gross Calculator</h2>
                    <p className="text-stone-400 text-sm">Find out what gross you need for your desired take-home</p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-stone-400 mb-2">I want to take home:</p>
                  <div className="text-5xl md:text-7xl font-black text-purple-400 mb-1 tabular-nums">
                    {formatCurrency(targetNetSalary)}
                  </div>
                </div>

                <input
                  type="range"
                  min="10000"
                  max="1500000"
                  step="5000"
                  value={targetNetSalary}
                  onChange={(e) => setTargetNetSalary(Number(e.target.value))}
                  className="w-full h-3 bg-stone-800 rounded-full appearance-none cursor-pointer mb-6"
                  style={{
                    background: `linear-gradient(to right, #8B5CF6 0%, #EC4899 ${(targetNetSalary - 10000) / (1500000 - 10000) * 100}%, #374151 ${(targetNetSalary - 10000) / (1500000 - 10000) * 100}%, #374151 100%)`
                  }}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-2xl p-5 text-center">
                    <p className="text-stone-400 mb-2">You need a gross salary of:</p>
                    <div className="text-4xl font-black text-white">{formatCurrency(grossFromNet)}</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 text-center">
                    <p className="text-stone-400 mb-2">Total deductions will be:</p>
                    <div className="text-4xl font-black text-red-400">{formatCurrency(reverseCalc.totalDeductions)}</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-stone-400 text-sm">PAYE Tax</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(reverseCalc.paye)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-stone-400 text-sm">NSSF</p>
                  <p className="text-xl font-bold text-blue-400">{formatCurrency(reverseCalc.nssf)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-stone-400 text-sm">SHIF</p>
                  <p className="text-xl font-bold text-purple-400">{formatCurrency(reverseCalc.shif)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-stone-400 text-sm">Housing Levy</p>
                  <p className="text-xl font-bold text-amber-400">{formatCurrency(reverseCalc.housingLevy)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bonus Calculator Tab */}
          {activeTab === 'bonus' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-pink-600/20 to-pink-900/20 backdrop-blur-xl rounded-3xl border border-pink-500/20 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Bonus & 13th Month Calculator</h2>
                    <p className="text-stone-400 text-sm">See how much you'll actually receive from your bonus</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-stone-400 mb-2">Your current monthly gross</label>
                    <div className="text-3xl font-bold text-white">{formatCurrency(grossSalary)}</div>
                    <p className="text-stone-500 text-sm">Adjust in Calculator tab</p>
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-2">Bonus amount</label>
                    <input
                      type="number"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(Number(e.target.value))}
                      className="w-full text-3xl font-bold bg-transparent border-b-2 border-pink-500 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-600/30 to-emerald-900/30 rounded-2xl p-5 text-center">
                    <p className="text-stone-400 mb-2">Net Bonus (Take Home)</p>
                    <div className="text-4xl font-black text-emerald-400">{formatCurrency(bonusCalc.netBonus)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-600/30 to-red-900/30 rounded-2xl p-5 text-center">
                    <p className="text-stone-400 mb-2">Tax on Bonus</p>
                    <div className="text-4xl font-black text-red-400">{formatCurrency(bonusCalc.bonusTax)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-600/30 to-amber-900/30 rounded-2xl p-5 text-center">
                    <p className="text-stone-400 mb-2">Effective Bonus Tax Rate</p>
                    <div className="text-4xl font-black text-amber-400">{bonusCalc.bonusTaxRate.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <p className="text-stone-400 text-sm">
                    <Info className="w-4 h-4 inline mr-2" />
                    Bonuses are taxed at your marginal tax rate (the rate of your highest tax band). 
                    Based on your salary of {formatCurrency(grossSalary)}, your bonus is taxed at approximately {bonusCalc.bonusTaxRate.toFixed(0)}%.
                  </p>
                </div>
              </div>

              {/* Bonus comparison chart */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <h3 className="text-lg font-bold mb-4">Bonus Net vs Tax</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Gross Bonus', gross: bonusAmount, net: 0, tax: 0 },
                      { name: 'Breakdown', gross: 0, net: bonusCalc.netBonus, tax: bonusCalc.bonusTax }
                    ]}>
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis tickFormatter={(v) => formatCompact(v)} stroke="#6B7280" />
                      <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                      <Bar dataKey="gross" name="Gross" fill="#6B7280" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="net" name="Net" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tax" name="Tax" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Employer Cost Tab */}
          {activeTab === 'employer' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Total Employer Cost</h2>
                    <p className="text-stone-400 text-sm">What it actually costs to employ someone</p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-stone-400 mb-2">For gross salary of {formatCurrency(grossSalary)}</p>
                  <div className="text-5xl md:text-7xl font-black text-blue-400">{formatCurrency(calculations.totalEmployerCost)}</div>
                  <p className="text-stone-500 mt-2">Total cost to employer per month</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-5 text-center">
                    <Wallet className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-stone-400 text-sm">Gross Salary</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(grossSalary)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 text-center">
                    <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-stone-400 text-sm">Employer NSSF (6%)</p>
                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(calculations.employerNSSF)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 text-center">
                    <Home className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-stone-400 text-sm">Employer Housing (1.5%)</p>
                    <p className="text-2xl font-bold text-amber-400">{formatCurrency(calculations.employerHousingLevy)}</p>
                  </div>
                </div>
              </div>

              {/* Employer cost pie */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <h3 className="text-lg font-bold mb-4">Employer Cost Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={employerCostData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {employerCostData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                      <Legend formatter={(v) => <span className="text-stone-300 text-sm">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-300 text-sm">
                  <Info className="w-4 h-4 inline mr-2" />
                  Employers must match employee NSSF and Housing Levy contributions. 
                  This adds {formatCurrency(calculations.employerNSSF + calculations.employerHousingLevy)} ({((calculations.employerNSSF + calculations.employerHousingLevy) / grossSalary * 100).toFixed(1)}%) 
                  to the cost of employment beyond gross salary.
                </p>
              </div>
            </div>
          )}

          {/* Compare Tab */}
          {activeTab === 'compare' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-amber-400" />
                  Salary Comparison Guide
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={salaryProgression}>
                      <XAxis dataKey="salary" stroke="#6B7280" />
                      <YAxis yAxisId="left" tickFormatter={(v) => formatCompact(v)} stroke="#6B7280" />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} stroke="#6B7280" />
                      <Tooltip formatter={(v, name) => name === 'effectiveRate' ? `${v}%` : formatCurrency(v)} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="gross" name="Gross" fill="#6B7280" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="left" dataKey="net" name="Net" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="effectiveRate" name="Effective Tax %" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Salary table */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-stone-400 font-medium">Gross Salary</th>
                      <th className="text-right py-3 px-4 text-stone-400 font-medium">PAYE Tax</th>
                      <th className="text-right py-3 px-4 text-stone-400 font-medium">Net Salary</th>
                      <th className="text-right py-3 px-4 text-stone-400 font-medium">Effective Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryProgression.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 font-medium">{formatCurrency(row.gross)}</td>
                        <td className="py-3 px-4 text-right text-red-400">{formatCurrency(row.paye)}</td>
                        <td className="py-3 px-4 text-right text-emerald-400">{formatCurrency(row.net)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.effectiveRate < 15 ? 'bg-emerald-500/20 text-emerald-400' :
                            row.effectiveRate < 25 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {row.effectiveRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tax Bands Reference */}
          <div className="mt-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-stone-400" />
              2026 Kenya PAYE Tax Bands
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-stone-400 text-sm">Monthly Band</th>
                    <th className="text-center py-2 px-3 text-stone-400 text-sm">Rate</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {TAX_BANDS.map((band, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 px-3">
                        {band.max === Infinity 
                          ? `Above ${formatCurrency(band.min)}` 
                          : `${formatCurrency(band.min)} - ${formatCurrency(band.max)}`}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${band.color}20`, color: band.color }}>
                          {band.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-stone-500 text-xs mt-3">Personal Relief: KES 2,400/month automatically applied</p>
          </div>

        </div>
      </main>
    </div>
  );
}
