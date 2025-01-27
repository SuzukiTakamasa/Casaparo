

const SlideAnimation = () => {
    const casaparoFellows = [
        "⚪️",
        "🦀",
        "🦵🦵",
        "🛀",
        "🛌",
        "💥",
        "🧊"
    ]
    return (
        <div className="w-full overflow-hidden">
            <div className="animate-slide flex whitespace-nowrap">
                {casaparoFellows.map((fellows, index) => (
                <div key={index} className="mx-4 text-white p-2 rounded-md">
                    {fellows}
                </div>
                ))}
                {casaparoFellows.map((fellows, index) => (
                <div key={index + casaparoFellows.length} className="mx-4 text-white p-2 rounded-md">
                    {fellows}
                </div>
                ))}
            </div>
        </div>
    )
}

export default SlideAnimation