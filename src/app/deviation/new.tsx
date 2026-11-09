import React, { useEffect, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { getInspection, Inspection, replacePhotos, saveDeviation, setPointState, listPointStates } from '../../lib/db';
import { pointByCode, suggestedSeverity } from '../../lib/fg';
import { deletePhotoFiles } from '../../lib/files';
import { DeviationForm } from '../../components/DeviationForm';

export default function NewDeviation() {
  const { inspectionId, point, tpl } = useLocalSearchParams<{ inspectionId: string; point?: string; tpl?: string }>();
  const [insp, setInsp] = useState<Inspection | null>(null);
  useEffect(() => { getInspection(inspectionId).then(setInsp); }, [inspectionId]);
  if (!insp) return <Stack.Screen options={{ title: 'Nytt avvik' }} />;

  const p = pointByCode(point);
  const t = p && tpl !== undefined ? p.avvik[Number(tpl)] : undefined;
  return (
    <>
      <Stack.Screen options={{ title: 'Nytt avvik' }} />
      <DeviationForm
        saveLabel="Lagre avvik"
        initialPhotos={[]}
        initial={{ point_code: p ? p.code : null, title: t?.text ?? '', location: '', comment: '', severity: t ? suggestedSeverity(t.cats) : 'liten' }}
        onSave={async (d, photos, removed) => {
          const id = await saveDeviation(d, { buildingId: insp.building_id, inspectionId: insp.id });
          await replacePhotos(id, photos);
          removed.forEach(deletePhotoFiles);
          if (d.point_code) {
            const st = (await listPointStates(insp.id)).get(d.point_code);
            await setPointState(insp.id, d.point_code, 'avvik', st?.note ?? '');
          }
          router.back();
        }}
      />
    </>
  );
}
