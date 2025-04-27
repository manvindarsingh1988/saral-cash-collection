import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function CollectorLedgers() {
  useDocumentTitle("Collector Ledgers");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold">Collector Ledgers</h1>
      <p className="mt-4 text-gray-600">
        This is the Collector Ledgers page. You can manage collector ledgers
        here.
      </p>
    </div>
  );
}
