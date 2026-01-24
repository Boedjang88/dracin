import Modal from '@/components/ui/modal'
import DramaPage from '../../../drama/[id]/page'

export default function DramaModal({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Modal>
            <DramaPage params={params} isModal={true} />
        </Modal>
    )
}
