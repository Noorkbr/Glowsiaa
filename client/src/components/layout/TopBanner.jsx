const messages = [
  '🚚 Free Delivery on Orders Above ৳999',
  '✨ 100% Authentic Premium Quality',
  '💄 New Arrivals Every Week',
  "🇧🇩 Bangladesh's #1 Premium Cosmetics Store"
]

export default function TopBanner() {
  return (
    <div className="overflow-hidden bg-gradient-to-r from-[#D5106E] to-[#6E3992] py-2.5">
      <div className="marquee-track flex items-center whitespace-nowrap">
        {[...messages, ...messages, ...messages].map((message, index) => (
          <span key={index} className="mx-8 text-xs font-medium tracking-wide text-white opacity-95 sm:text-sm">
            {message}
          </span>
        ))}
      </div>
    </div>
  )
}
