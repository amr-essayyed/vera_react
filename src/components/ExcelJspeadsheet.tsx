import React, {useRef} from "react";
import {Spreadsheet, Worksheet, jspreadsheet} from "@jspreadsheet/react";

// Required CSS imports
import "jsuites/dist/jsuites.css";
import "jspreadsheet/dist/jspreadsheet.css";

// Set your JSS license key (The following key only works for one day)
jspreadsheet.setLicense('ODM0MzJlMzY2YWMzZWE1NDc1MDM2ZDZiYTcxM2EyY2VjMTRlMTUzNTY4NjlkZjc1OTQ5ZTIxNTM4NTZmYmJlOGE0NTdkNjg3ODdkNTJkZTIyN2RlZjI3NDViYTdhMDFiNGQ2NThkOGQ5MWE5MGU4Yzc1NWM1MjhjZDc0ZDVlMWIsZXlKamJHbGxiblJKWkNJNklpSXNJbTVoYldVaU9pSktjM0J5WldGa2MyaGxaWFFpTENKa1lYUmxJam94TnpZME1qSXlNelV5TENKa2IyMWhhVzRpT2xzaWFuTndjbVZoWkhOb1pXVjBMbU52YlNJc0ltTnZaR1Z6WVc1a1ltOTRMbWx2SWl3aWFuTm9aV3hzTG01bGRDSXNJbU56WWk1aGNIQWlMQ0p6ZEdGamEySnNhWFI2TG1sdklpd2lkMlZpWTI5dWRHRnBibVZ5TG1sdklpd2liRzlqWVd4b2IzTjBJbDBzSW5Cc1lXNGlPaUl6TkNJc0luTmpiM0JsSWpwYkluWTNJaXdpZGpnaUxDSjJPU0lzSW5ZeE1DSXNJbll4TVNJc0luWXhNaUlzSW1Ob1lYSjBjeUlzSW1admNtMXpJaXdpWm05eWJYVnNZU0lzSW5CaGNuTmxjaUlzSW5KbGJtUmxjaUlzSW1OdmJXMWxiblJ6SWl3aWFXMXdiM0owWlhJaUxDSmlZWElpTENKMllXeHBaR0YwYVc5dWN5SXNJbk5sWVhKamFDSXNJbkJ5YVc1MElpd2ljMmhsWlhSeklpd2lZMnhwWlc1MElpd2ljMlZ5ZG1WeUlpd2ljMmhoY0dWeklpd2labTl5YldGMElsMHNJbVJsYlc4aU9uUnlkV1Y5');

export default function App() {
    // Spreadsheet array of worksheets
    const spreadsheet = useRef();

    const data = [
      ['LemonadejS', 'https://lemonadejs.net/templates/default/img/components.svg'],
    ];  
    
    // Column definitions
    const columns = [
      { type: 'text', width: 300, title: 'Title' },
      { type: 'image', width: 120, title: 'Image' },
    ]
    // Render component
    return (
      <Spreadsheet ref={spreadsheet} >
          <Worksheet data={data} columns={columns} minDimensions={[2,4]} />
      </Spreadsheet>
    );
}