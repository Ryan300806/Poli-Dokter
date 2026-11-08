export default function Welcome() {
    return (
        <main className="mx-auto max-w-3xl p-8">
            <div className="rounded-xl border border-brand-200 bg-white p-6">
                <h1 className="text-2xl font-semibold text-brand-800">Poli-Dokter</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Inertia dan React sudah berjalan.
                </p>
                <button className="mt-4 rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600">
                    Tombol contoh
                </button>
            </div>
        </main>
    );
}