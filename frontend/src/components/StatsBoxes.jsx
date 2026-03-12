import React from "react";

const StatsBoxes = ({ items = [] }) => {
    const defaultGradients = [
        "linear-gradient(to right, #5B0704 0%, #A71D0D 50%, #D12B1E 100%)",
        "linear-gradient(to right, #D12B1E 0%, #B40001 50%, #E5CFB5 100%)",
        "linear-gradient(to right, #B40001 0%, #E29A7D 50%, #F5E0C3 100%)",
    ];

    const glassGlowClass = `
    backdrop-blur-md
    rounded-2xl
    shadow-[0_4px_20px_rgba(189,150,0,0.25),0_0_40px_rgba(189,150,0,0.15)]
    transition-all duration-300
    flex items-center gap-6
    p-8
    text-white
  `;

    return (
        <div className="grid gap-8"
            style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
            }}
        >
            {items.map((item, i) => {
                const gradient = defaultGradients[i % defaultGradients.length];
                return (
                    <div key={i} className={glassGlowClass} style={{ background: gradient }}>
                        {item.icon && (
                            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-3xl">
                                {item.icon}
                            </div>
                        )}
                        <div>
                            <p className="text-4xl font-bold">{item.value}</p>
                            <p className="text-lg text-white/80">{item.title}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsBoxes;
