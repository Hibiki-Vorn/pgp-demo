export default (props) => {
    let fileRef = null;

    const handleFileChange = async () => {
        const file = fileRef.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const text = new TextDecoder().decode(bytes);
        console.log(props.callback);

        props.callback(text);
    };

    return (
        <>
            <input type="file" hidden={true} ref={fileRef} onChange={handleFileChange} />
            <button onclick={() => fileRef?.click()}>Upload Key</button>
        </>
    );
};
