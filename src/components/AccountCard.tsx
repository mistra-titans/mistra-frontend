import React from "react";

interface AccountCardProps {
  totalBalance: string;
  cardNumber: string;
  cardHolder: string;
 
  expiryDate?: string;
  className?: string;
}

const AccountCard: React.FC<AccountCardProps> = ({
  totalBalance,
  cardNumber,
  cardHolder,
  
  expiryDate = "12/25",
  className = "",
}) => {
  return (
    <div className={`w-full h-[230px] rounded-2xl overflow-hidden relative border-1.5 border-neutral-400 ${className}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 10px, transparent 10px),
                             radial-gradient(circle at 0 0, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 10px, transparent 10px)`,
            backgroundSize: '60px 60px',
            transform: 'rotate(-45deg)',
          }} />
        </div>
      </div>

      {/* Card content */}
      <div className="relative h-full p-6 flex flex-col justify-between text-white">
        <div className="space-y-4">
          {/* Card chip and type */}
          <div className="flex items-center justify-between">
            <div className="w-12 h-9 rounded bg-yellow-200/80 overflow-hidden relative">
              {/* Chip design */}
              <div className="absolute inset-0 grid grid-cols-3 gap-px bg-yellow-600/20">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="bg-yellow-200/80" />
                ))}
              </div>
            </div>
            <div className="text-2xl font-bold italic">
              MISTRA
            </div>
          </div>

          {/* Balance */}
          <div>
            <p className="text-sm opacity-75">Available Balance</p>
            <p className="text-2xl font-bold">{totalBalance}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Card number */}
          <div>
            <p className="text-lg tracking-widest font-medium">{cardNumber}</p>
          </div>

          {/* Card holder and expiry */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs opacity-75">CARD HOLDER</p>
              <p className="font-medium uppercase">{cardHolder}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">EXPIRES</p>
              <p className="font-medium">{expiryDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
