import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function CarouselSection() {
  const items = [
    {
      title: "Kelola Keuangan",
      desc: "Catat pemasukan dan pengeluaran dengan mudah",
    },
    {
      title: "Pantau Harian",
      desc: "Lihat semua transaksi harianmu",
    },
    {
      title: "Analisis Cerdas",
      desc: "Dapatkan insight keuangan otomatis",
    },
    {
      title: "Aman",
      desc: "Data kamu tersimpan dengan aman",
    },
    {
      title: "Mulai Sekarang",
      desc: "Bangun kebiasaan finansial yang baik",
    },
  ];

  return (
    <div className="flex justify-center">
      <Carousel className="w-full max-w-md">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index} className="md:basis-1/2">
              <div className="p-2">
                <Card className="rounded-xl shadow-md hover:shadow-lg transition">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                    
                    <h3 className="text-lg font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {item.desc}
                    </p>

                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}