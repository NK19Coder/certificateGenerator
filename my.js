document.addEventListener("DOMContentLoaded", () => {
    const userName = document.getElementById("name");
    const collegeName = document.getElementById("college");
    const submitBtn = document.getElementById("submitBtn");

    const { PDFDocument, rgb, degrees } = PDFLib;

    const capitalize = (str, lower = false) =>
        (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
            match.toUpperCase()
        );

    submitBtn.addEventListener("click", async() => {
        const val = capitalize(userName.value);
        const college = capitalize(collegeName.value);
        const isNamePresent = await checkNamePresence(val);
        if (isNamePresent) {
            if (val.trim() !== "" && college.trim() !== "" && userName.checkValidity() && collegeName.checkValidity()) {
                generatePDF(val, college);
            } else {
                userName.reportValidity();
                collegeName.reportValidity();
            }
        } else {
            alert("Please enter a valid name.");
        }
    });

    const checkNamePresence = async(name) => {
        const nameListResponse = await fetch("./name.txt");
        const nameListText = await nameListResponse.text();
        const names = nameListText.split("\n").map((line) => line.trim().toLowerCase());
        return names.includes(name.toLowerCase());
    };

    const generatePDF = async(name, college) => {
        const existingPdfBytes = await fetch("./certificate.pdf").then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit); 
        const fontBytes = await fetch("./NetflixSans-Regular.otf").then((res) => res.arrayBuffer());
        const MTCORSVA = await pdfDoc.embedFont(fontBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const textWidthName = MTCORSVA.widthOfTextAtSize(name, 28);
        const textWidthCollege = MTCORSVA.widthOfTextAtSize(college, 20);
        const pageWidth = firstPage.getSize().width;
        const centerXName = (pageWidth - textWidthName) / 2;
        const centerXCollege = (pageWidth - textWidthCollege) / 2;

        firstPage.drawText(name, {
            x: centerXName,
            y: 350,
            size: 26,
            font: MTCORSVA,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(college, {
            x: centerXCollege,
            y: 320,
            size: 20,
            font: MTCORSVA,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        console.log("Done creating");
        var file = new File([pdfBytes], "Certificate.pdf", { 
            type: "application/pdf;charset=utf-8",
        });
        saveAs(file);
    };
});
