const Footer = () => (
	<footer className="text-black py-8 border-t border-solid border-black">
    <div className="container mx-auto ">
        <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0">
            <div className="flex flex-col lg:flex-row lg:items-center">
                <h3 className="text-lg font-semibold mb-0 ml-4 lg:ml-0">ABDELRAZAQ.COM</h3>
                <div>
                <ul className="flex flex-col lg:flex-row lg:ml-4 pl-0">
                    <li><a href="#" className="text-gray-400 hover:text-black ml-4">Blog</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-black ml-4">Images</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-black ml-4">Image Tags</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-black ml-4">Mood</a></li>
                </ul>
            </div>
            </div>

            
        </div>
    </div>
</footer>

);

export default Footer;
