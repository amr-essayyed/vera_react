import { useAllResource } from '@/hooks/useResource';
import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import { useRef } from 'react';

// register Handsontable's modules
registerAllModules();

const ExcelLikeTabel = () => {
    const hotRef = useRef<any>(null);
    const {data: contacts} = useAllResource("contact");

    const changeHandler = (changes: any, source: string) => {
        if (!changes || changes.length === 0) return;
        console.log("change👌");
        console.log(changes);
        console.log(source);
        if(changes[0][0] == 0) {
            if (changes[0][3] == "vendor") {
                console.log("vendor column detected at col: ", changes[0][1]);
                if (hotRef.current && hotRef.current.hotInstance) {
                    const hot = hotRef.current.hotInstance;

                    hot.updateSettings({
                        cells: (row, col) => {
                            const cellProperties = {};
                            if (col === changes[0][1] && row > 0) {
                                cellProperties.type = 'dropdown';
                                cellProperties.source = contacts.map((c)=>`[${c.id}, ${c.name}]`);
                            }
                            return cellProperties;
                        }
                    });

                }
            }
        }
    }

    return (
        <HotTable
            ref={hotRef}
            themeName="ht-theme-main"
            data={[
                ["Image", "Product Name", "Description", "unit price", "vendor", ""],
                []
                // ['', 'Tesla', 'Volvo', 'Toyota', 'Ford'],
                // ['2019', 10, 11, 12, 13],
                // ['2020', 20, 11, 14, 13],
                // ['2021', 30, 15, 12, 13],
            ]}
            rowHeaders={true}
            colHeaders={true}
            height="auto"
            autoWrapRow={true}
            autoWrapCol={true}
            contextMenu={true}
            licenseKey="non-commercial-and-evaluation" // for non-commercial use only
            // columns={[
            //     {}, // first column: default (Year)
            //     { type: 'dropdown', source: ['Tesla', 'Volvo', 'Toyota', 'Ford'] },
            //     { type: 'dropdown', source: ['Tesla', 'Volvo', 'Toyota', 'Ford'] },
            //     { type: 'dropdown', source: ['Tesla', 'Volvo', 'Toyota', 'Ford'] },
            //     { type: 'dropdown', source: ['Tesla', 'Volvo', 'Toyota', 'Ford'] },
            // ]}
            afterChange={changeHandler}
        />
    );
};

export default ExcelLikeTabel;

// // 1. First install the easiest spreadsheet library:
// // npm install react-spreadsheet

// import Spreadsheet from "react-spreadsheet";
// import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";

// export default function SimpleExcelTable() {
//   const [data, setData] = useState([
//     [{ value: "Name" }, { value: "Age" }, { value: "City" }],
//     [{ value: "Ahmed" }, { value: 25 }, { value: "Cairo" }],
//     [{ value: "Sara" }, { value: 22 }, { value: "Giza" }]
//   ]);

//   const vendorSelect = (
//     <select name="" id="">
//         <option value="1">applw</option>
//         <option value="2">apple</option>
//     </select>
//   )

//   useEffect(()=>{
//     const vendor= data[0]?.findIndex((title)=> title.value === "vendor");
//     if(vendor && vendor >= 0) {
//         for (let i=1; i <data.length; i++) {
//             data[i][vendor] = vendorSelect;
//         }
//     }
//   }, [data])

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <Card className="rounded-2xl shadow-md overflow-scroll max-h-90">
//         <CardContent className="p-4">
//           <Spreadsheet
//             data={data}
//             onChange={setData}
//           />
//         </CardContent>
//       </Card>
//       <div>
//         {data[0][3]?.value}
//       </div>
//     </div>
//   );
// }
