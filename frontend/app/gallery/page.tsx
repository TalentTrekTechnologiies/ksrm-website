export default function Gallery() {
  return (
    <main className="min-h-screen bg-[#f4f3ef] pt-4">
      <section className="relative py-20 bg-[#2B3490]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white font-rajdhani">Gallery</h1>
          <p className="text-white/80 mt-2">KSRM College of Engineering</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl p-12 shadow-sm">
          <h2 className="text-2xl font-bold text-[#2B3490] font-rajdhani mb-4">Photo Gallery</h2>
          <p className="text-gray-600">Campus photos, events and memories from KSRM College will be displayed here.</p>
        </div>
      </section>
    </main>
  )
}
