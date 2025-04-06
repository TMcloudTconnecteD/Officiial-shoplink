import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { useCreateCategoryMutation, useDeleteCategoryMutation, useFetchCategoriesQuery, useUpdateCategoryMutation } from '../../redux/Api/categoryApiSlice';
import CategoryForm from '../../components/CategoryForm';
import Modal from '../../components/Modal';



const CategoryList = () => {
 const {data: categories} = useFetchCategoriesQuery();
// console.log(categories);
 const [name, setName] = useState('')
 const [selectedCategory, setSelectedCategory] = useState(null)
 const [updatingName, setUpdatingName] = useState('')
 const [modalVisible, setModalVisible] = useState(false)

 const [createCategory] = useCreateCategoryMutation()
 const [updateCategory] = useUpdateCategoryMutation()
 const [deleteCategory] = useDeleteCategoryMutation()




const handleCreateCategory = async (e) => {
    e.preventDefault()

    if (!name) {
        toast.error('Please enter a category name')
        return
    }

    try {
        const res = await createCategory({ name }).unwrap()

        if (res.error) {
            toast.error('Error creating category')
            return
        } else {
            setName('')
       // console.log(`${res.name} successfully created`, res)
        toast.success(`${res.name} created successfully`)
       
        }


    } catch (error) {
       console.error('Error creating category:', error)
       toast.error('Error creating category, Try again') 
    }
}

const handleUpdateCategory = async (e) => {
    e.preventDefault()
        if (!updatingName) {
            toast.error('Please enter a category name')
            return
            
        }
        try {
            const res = await updateCategory({
                categoryId: selectedCategory._id,
                updatedCategory: { name: updatingName },
            }).unwrap()
                if (res.error) {
                    toast.error(res.error)
                    
                } else {
                    toast.success(`${res.name} updated successfully`)
                    setSelectedCategory(null)
                    setUpdatingName('')
                    setModalVisible(false)
                }

            
        } catch (error) {
            console.error('Error updating category:', error)


            
        }
}


const handleDeleteCategory = async () => {
        try {
            const res = await deleteCategory(selectedCategory._id).unwrap()
            if (res.error) {
                toast.error(res.error)
                
            } else {
                toast.success(`${res.name} deleted successfully`)
                setSelectedCategory(null)
                setModalVisible(false)
            }
            
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error('Error deleting category,try again')
            
        }
}

  return <div className="ml-[10rem] flex flex-col md:flex-row ">
    {/*<AdminMenu />*/}
    <div className="md:w-3/4 p-3">
        <div className="h-12">
            <h1 className="text-2xl font-semibold mb-4"> Manage Categories </h1>
        </div>
        <CategoryForm  value={name} setValue={setName} handleSubmit={handleCreateCategory} />
        <br />
        <hr />
        <div className="flex flex-wrap">
            {categories?.map(category => (
                <div key={category._id} className="bg-gray-200 p-4 m-2 rounded-lg shadow-md w-[30%]">
                    <h2 className="text-lg font-semibold">{/*category.name*/}</h2>
                    <button 
                    className="bg-blue-500 text-orange border border-pink-500 py-2 px-4 rounded-lg m-3 
                    hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-orange-500"
                    onClick={() => {{
                        setModalVisible(true)
                        selectedCategory(category)
                        setUpdatingName(category.name)}}}
                    >{category.name}</button>
                    <button onClick={() => {
                        setSelectedCategory(category)
                        handleDeleteCategory(category._id)} }
                        className="bg-red-500 text-white py-1 px-3 rounded-lg mt-2">
                            X </button>
                </div>
            ))}
        </div>

                <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
                        <CategoryForm value= {updatingName} setValue={value => setUpdatingName(value)}
                            handleSubmit={handleUpdateCategory}
                            buttonText='Update'
                            handleDelete={handleDeleteCategory}/>
                </Modal>
        
    </div>
  </div>
}

export default CategoryList;