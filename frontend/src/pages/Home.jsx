import React, { useEffect, useState } from 'react';
import { listObjs, uploadObj, getMeasurements } from '../api';
import ObjList from '../components/ObjList';
import MeasurementModal from '../components/MeasurementModal';

export default function Home() {
  const [objs, setObjs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [measurement, setMeasurement] = useState(null);

  useEffect(() => {
    listObjs().then(data => setObjs(data.objs || []));
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) await uploadObj(file);
    listObjs().then(data => setObjs(data.objs || []));
  };

  const handleMeasure = async (filename) => {
    const result = await getMeasurements(filename);
    setMeasurement(result);
    setModalOpen(true);
  };

  return (
    <div>
      <h1>Uploaded Scans</h1>
      <input type="file" accept=".obj" onChange={handleUpload} />
      <ObjList objs={objs} onMeasure={handleMeasure} />
      <a href="/viewer">View All on 3D Map</a>
      <MeasurementModal open={modalOpen} onClose={() => setModalOpen(false)} data={measurement} />
    </div>
  );
}

