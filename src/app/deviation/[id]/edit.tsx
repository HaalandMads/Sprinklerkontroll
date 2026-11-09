import React, { useEffect, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { DeviationListItem, getDeviation, listPhotos, Photo, replacePhotos, saveDeviation } from '../../../lib/db';
import { deletePhotoFiles } from '../../../lib/files';
import { DeviationForm } from '../../../components/DeviationForm';

export default function EditDeviation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [d, setD] = useState<DeviationListItem | null>(null);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  useEffect(() => { getDeviation(id).then(setD); listPhotos(id).then(setPhotos); }, [id]);
  if (!d || !photos) return <Stack.Screen options={{ title: 'Endre avvik' }} />;
  return (
    <>
      <Stack.Screen options={{ title: `Endre A-${d.nr}` }} />
      <DeviationForm
        saveLabel="Lagre endringer"
        initial={{ point_code: d.point_code, title: d.title, location: d.location, comment: d.comment, severity: d.severity }}
        initialPhotos={photos.map((p) => ({ id: p.id, file: p.file, thumb: p.thumb }))}
        onSave={async (x, ph, removed) => {
          await saveDeviation(x, { id, buildingId: d.building_id, inspectionId: d.inspection_id });
          await replacePhotos(id, ph);
          removed.forEach(deletePhotoFiles);
          router.back();
        }}
      />
    </>
  );
}
