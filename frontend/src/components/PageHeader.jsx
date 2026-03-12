const PageHeader = ({ icon, title, subtitle, right }) => {
    const glassGlow = `
    backdrop-blur-md
    bg-white/30
    rounded-2xl
    border border-white/30
    shadow-[0_0_20px_rgba(247,223,168,0.35)]
  `;

    return (
        <header className={`${glassGlow} p-6 flex items-center justify-between`}>
            <div className="flex items-center gap-4">
                {icon && (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center
                          bg-gradient-to-br from-[#B40001] to-[#E29A7D] text-white text-xl">
                        {icon}
                    </div>
                )}

                <div>
                    <h1 className="text-2xl font-bold text-[#4B0503]">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-[#4B0503]/70">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* RIGHT SLOT */}
            {right}
        </header>
    );
};

export default PageHeader;
