import { Grid, type GridProps } from "@/components/grid";
import { SaveCard } from "@/components/save-card";
import type { Save } from "@/lib/database.types";

type SaveGridProps = Omit<GridProps<Save>, "data" | "renderItem" | "keyExtractor"> & {
  saves: Save[];
};

/** Image-first grid of `SaveCard`s. */
export function SaveGrid({ saves, ...rest }: SaveGridProps) {
  return (
    <Grid
      {...rest}
      data={saves}
      keyExtractor={(save) => save.id}
      renderItem={(save) => <SaveCard save={save} />}
    />
  );
}
