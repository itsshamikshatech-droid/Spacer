export default function SpaceDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold font-headline mb-4">Space Details</h1>
      <p className="text-lg text-muted-foreground">Showing details for space with ID: {params.id}</p>
    </div>
  );
}
