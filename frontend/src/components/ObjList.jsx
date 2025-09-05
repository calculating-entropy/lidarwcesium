// import React from 'react';
// import { API_URL } from '../api';

// export default function ObjList({ objs, onMeasure }) {
//   return (
//     <table>
//       <thead>
//         <tr>
//           <th>Filename</th>
//           <th>Timestamp</th>
//           <th>Download</th>
//           <th>Measure</th>
//         </tr>
//       </thead>
//       <tbody>
//         {objs.map(obj => (
//           <tr key={obj.filename}>
//             <td>{obj.filename}</td>
//             <td>{new Date(obj.timestamp * 1000).toLocaleString()}</td>
//             <td>
//               <a
//                 href={`${API_URL}${obj.download_url}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 Download
//               </a>
//             </td>
//             <td>
//               <button onClick={() => onMeasure(obj.filename)}>Get Measurements</button>
//             </td>
//             <td>
//             <a href={`/modelviewer?file=${encodeURIComponent(obj.filename)}`}>
//               View Details
//             </a>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }
import React from 'react';
import { API_URL } from '../api';

export default function ObjList({ objs, onMeasure }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Filename</th>
          <th>Timestamp</th>
          <th>Download</th>
          <th>Measure</th>
          <th>View Details</th> {/* Added header */}
        </tr>
      </thead>
      <tbody>
        {objs.map(obj => (
          <tr key={obj.filename}>
            <td>{obj.filename}</td>
            <td>{new Date(obj.timestamp * 1000).toLocaleString()}</td>
            <td>
              <a
                href={`${API_URL}${obj.download_url}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </td>
            <td>
              <button onClick={() => onMeasure(obj.filename)}>Get Measurements</button>
            </td>
            <td>
              <a href={`/modelviewer?file=${encodeURIComponent(obj.filename)}`}>
                View Details
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
