import { Card, CardContent } from "@/components/ui/card";

type dataProps = {
  name: string;
  stat: string;
};

export default function CardStats({ data }: { data: dataProps[] }) {
  return (
    <div className="flex w-full items-center justify-center p-10">
      <dl className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((item) => (
          <Card key={item.name} className="py-4">
            <CardContent className="">
              <dt className="text-muted-foreground text-sm">{item.name}</dt>
              <dd className="text-foreground text-2xl font-semibold">
                {item.stat}
              </dd>
            </CardContent>
          </Card>
        ))}
      </dl>
    </div>
  );
}
